"""Lernhub-Stimmen-Server (Chatterbox, lokal auf 127.0.0.1).

Wird von agent/bridge.ps1 mit der Python-Umgebung aus chatterbox-installieren.ps1 gestartet.
  GET  /health  -> {"ok":true,"ready":bool,"device":"cuda","error":""}
  POST /tts     -> audio/wav   (Header X-Lernhub-Token, JSON {text, voice, rate, pitch, lang, exag, cfg, char})
  POST /voice?char=<id>        -> eigene Stimme (WAV-Body, 5-40 s) speichern; &del=1 loescht sie
  GET  /voices                 -> {"own":[figur-ids mit eigener Stimme]}
Jede Figur bekommt eine Referenzstimme, die einmalig mit edge-tts erzeugt wird (refs/<voice>_<rate>_<pitch>.wav).
Eigene Aufnahme statt dessen: refs/custom/<figur-id>.wav (ca. 10 s, klar gesprochen) ablegen.
"""
import argparse
import asyncio
import hashlib
import hmac
import io
import json
import os
import re
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

BASE = os.path.join(os.environ.get("LOCALAPPDATA", os.path.expanduser("~")), "lernhub-tts")
REFS = os.path.join(BASE, "refs")
CUSTOM = os.path.join(REFS, "custom")
CACHE = os.path.join(BASE, "cache")
for d in (REFS, CUSTOM, CACHE):
    os.makedirs(d, exist_ok=True)

RE_VOICE = re.compile(r"^[a-z]{2}-[A-Z]{2}-[A-Za-z]+Neural$")
RE_RATE = re.compile(r"^[+-]\d{1,2}%$")
RE_PITCH = re.compile(r"^[+-]\d{1,3}Hz$")
RE_CHAR = re.compile(r"^[a-z0-9_-]{1,40}$")
RE_LANG = re.compile(r"^[a-z]{2}$")

REF_TEXT = {
    "de": "Hallo! Schön, dass du da bist. Heute lernen wir zusammen etwas Neues, und ich erkläre dir alles "
          "Schritt für Schritt. Keine Sorge, wenn etwas nicht sofort klappt – das gehört einfach dazu. Also, los geht's!",
    "en": "Hello! Great to see you. Today we are going to learn something new together, and I will explain "
          "everything step by step. Don't worry if it doesn't work right away – that's part of it. So, let's go!",
}

STATE = {"model": None, "ready": False, "error": "", "device": "", "langs": []}
GPU_LOCK = threading.Lock()
REF_LOCK = threading.Lock()
CONDS = {}


def load_model():
    try:
        import torch
        from chatterbox import mtl_tts
        dev = "cuda" if torch.cuda.is_available() else "cpu"
        STATE["device"] = dev
        STATE["model"] = mtl_tts.ChatterboxMultilingualTTS.from_pretrained(device=dev)
        STATE["langs"] = sorted(getattr(mtl_tts, "SUPPORTED_LANGUAGES", {}).keys())
        STATE["ready"] = True
    except Exception as e:  # Fehler nur melden, Server bleibt fuer /health erreichbar
        STATE["error"] = f"{type(e).__name__}: {e}"[:300]


def prune_cache(days=14):
    limit = time.time() - days * 86400
    for f in os.listdir(CACHE):
        p = os.path.join(CACHE, f)
        try:
            if os.path.getmtime(p) < limit:
                os.remove(p)
        except OSError:
            pass


def ref_for(char, voice, rate, pitch, lang):
    """Pfad zur Referenzstimme; eigene Aufnahme hat Vorrang, sonst einmalig per edge-tts erzeugen."""
    if char:
        own = os.path.join(CUSTOM, char + ".wav")
        if os.path.isfile(own):
            return own
    name = f"{voice}_{rate}_{pitch}".replace("%", "p").replace("+", "u").replace("-", "m")
    wav = os.path.join(REFS, name + ".wav")
    if os.path.isfile(wav):
        return wav
    with REF_LOCK:
        if os.path.isfile(wav):
            return wav
        import edge_tts
        import librosa
        import soundfile as sf
        text = REF_TEXT["de" if voice.startswith("de-") else "en"]
        mp3 = os.path.join(REFS, name + ".mp3")
        asyncio.run(edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(mp3))
        y, sr = librosa.load(mp3, sr=None, mono=True)
        sf.write(wav, y, sr)
        os.remove(mp3)
    return wav


def synth(text, ref, lang, exag, cfg):
    import soundfile as sf
    model = STATE["model"]
    with GPU_LOCK:
        key = (ref, os.path.getmtime(ref), round(exag, 2))
        if key in CONDS:
            model.conds = CONDS[key]
        else:
            model.prepare_conditionals(ref, exaggeration=exag)
            CONDS[key] = model.conds
        wav = model.generate(text, language_id=lang, exaggeration=exag, cfg_weight=cfg)
    buf = io.BytesIO()
    sf.write(buf, wav.squeeze(0).detach().cpu().numpy(), model.sr, format="WAV")
    return buf.getvalue()


def read_token(path):
    try:
        with open(path, encoding="utf-8") as f:
            m = re.search(r'LERNHUB_TOKEN\s*=\s*"([0-9a-f]{16,128})"', f.read())
        return m.group(1) if m else ""
    except OSError:
        return ""


class Handler(BaseHTTPRequestHandler):
    server_version = "LernhubTTS/1.0"

    def log_message(self, *args):
        pass

    def _host_ok(self):
        host = (self.headers.get("Host") or "").split(":")[0].lower()
        return host in ("127.0.0.1", "localhost")

    def _send(self, code, body=b"", ctype="application/json"):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Lernhub-Token")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if body:
            self.wfile.write(body)

    def _json(self, code, obj):
        self._send(code, json.dumps(obj).encode("utf-8"))

    def do_OPTIONS(self):
        if not self._host_ok():
            return self._send(403)
        self._send(204)

    def do_GET(self):
        if not self._host_ok():
            return self._send(403)
        if self.path == "/health":
            return self._json(200, {"ok": True, "ready": STATE["ready"], "device": STATE["device"],
                                    "error": STATE["error"], "langs": STATE["langs"]})
        if self.path == "/voices":
            if not self._token_ok():
                return self._json(403, {"ok": False, "error": "token"})
            own = sorted(f[:-4] for f in os.listdir(CUSTOM) if f.endswith(".wav") and RE_CHAR.match(f[:-4]))
            return self._json(200, {"ok": True, "own": own})
        self._json(404, {"ok": False})

    def _token_ok(self):
        token = read_token(self.server.token_file)
        given = self.headers.get("X-Lernhub-Token") or ""
        return bool(token) and hmac.compare_digest(given.encode(), token.encode())

    def _voice(self):
        """Eigene Stimme: POST /voice?char=<id> mit WAV (5–40 s) speichern, ?char=<id>&del=1 löschen."""
        q = dict(p.split("=", 1) for p in (self.path.split("?", 1) + [""])[1].split("&") if "=" in p)
        char = q.get("char", "")
        if not RE_CHAR.match(char):
            return self._json(400, {"ok": False, "error": "figur"})
        dest = os.path.join(CUSTOM, char + ".wav")
        if q.get("del") == "1":
            if os.path.isfile(dest):
                os.remove(dest)
            return self._json(200, {"ok": True})
        try:
            n = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            n = -1
        if n <= 44 or n > 4_000_000:
            return self._json(400, {"ok": False, "error": "laenge"})
        try:
            import soundfile as sf
            y, sr = sf.read(io.BytesIO(self.rfile.read(n)), dtype="float32", always_2d=True)
            y = y.mean(axis=1)
            dur = len(y) / sr
            if dur < 5 or dur > 40 or float(abs(y).max()) < 0.02:
                return self._json(400, {"ok": False, "error": "dauer" if dur < 5 or dur > 40 else "leise"})
            sf.write(dest, y, sr, subtype="PCM_16")
        except Exception:
            return self._json(400, {"ok": False, "error": "format"})
        return self._json(200, {"ok": True, "sekunden": round(dur, 1)})

    def do_POST(self):
        if not self._host_ok():
            return self._send(403)
        route = self.path.split("?", 1)[0]
        if route not in ("/tts", "/voice"):
            return self._send(404)
        if not self._token_ok():
            return self._json(403, {"ok": False, "error": "token"})
        if route == "/voice":
            return self._voice()
        try:
            n = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            n = -1
        if n <= 0 or n > 8000:
            return self._json(400, {"ok": False, "error": "laenge"})
        try:
            req = json.loads(self.rfile.read(n).decode("utf-8"))
            text = re.sub(r"\s+", " ", str(req.get("text", ""))).strip()[:600]
            voice = str(req.get("voice", ""))
            rate = str(req.get("rate", "+0%"))
            pitch = str(req.get("pitch", "+0Hz"))
            lang = str(req.get("lang", "de"))
            char = str(req.get("char", ""))
            exag = min(max(float(req.get("exag", 0.5)), 0.25), 1.5)
            cfg = min(max(float(req.get("cfg", 0.5)), 0.0), 1.0)
        except (ValueError, TypeError, AttributeError):
            return self._json(400, {"ok": False, "error": "json"})
        if (not text or not RE_VOICE.match(voice) or not RE_RATE.match(rate) or not RE_PITCH.match(pitch)
                or not RE_LANG.match(lang) or (char and not RE_CHAR.match(char))):
            return self._json(400, {"ok": False, "error": "eingabe"})
        if not STATE["ready"]:
            return self._json(503, {"ok": False, "error": STATE["error"] or "laedt"})
        if STATE["langs"] and lang not in STATE["langs"]:
            return self._json(400, {"ok": False, "error": "sprache"})
        try:
            ref = ref_for(char, voice, rate, pitch, lang)
            key = hashlib.sha256(json.dumps([text, ref, os.path.getmtime(ref), lang, exag, cfg]).encode()).hexdigest()
            path = os.path.join(CACHE, key + ".wav")
            if os.path.isfile(path):
                with open(path, "rb") as f:
                    data = f.read()
            else:
                data = synth(text, ref, lang, exag, cfg)
                with open(path, "wb") as f:
                    f.write(data)
        except Exception as e:
            print("Fehler:", type(e).__name__, e, file=sys.stderr)
            return self._json(500, {"ok": False, "error": "synthese"})
        self._send(200, data, "audio/wav")


def watch_parent(pid):
    """Beendet den Server, sobald die Bridge (Elternprozess) weg ist – gibt den Grafikspeicher frei."""
    import ctypes
    from ctypes import wintypes
    k = ctypes.WinDLL("kernel32", use_last_error=True)
    k.OpenProcess.restype = wintypes.HANDLE
    k.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
    k.GetExitCodeProcess.argtypes = [wintypes.HANDLE, ctypes.POINTER(wintypes.DWORD)]
    k.CloseHandle.argtypes = [wintypes.HANDLE]
    while True:
        time.sleep(10)
        h = k.OpenProcess(0x1000, False, pid)  # PROCESS_QUERY_LIMITED_INFORMATION
        code = wintypes.DWORD(0)
        ok = bool(h) and k.GetExitCodeProcess(h, ctypes.byref(code))
        if h:
            k.CloseHandle(h)
        if not ok or code.value != 259:  # 259 = STILL_ACTIVE
            os._exit(0)


def no_power_throttling():
    """Windows drosselt Prozesse ohne sichtbares Fenster (EcoQoS) - das macht die Sprachausgabe mehrfach langsamer."""
    import ctypes
    from ctypes import wintypes

    class State(ctypes.Structure):
        _fields_ = [("Version", ctypes.c_ulong), ("ControlMask", ctypes.c_ulong), ("StateMask", ctypes.c_ulong)]

    k = ctypes.WinDLL("kernel32", use_last_error=True)
    k.GetCurrentProcess.restype = wintypes.HANDLE
    k.SetProcessInformation.argtypes = [wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD]
    k.SetPriorityClass.argtypes = [wintypes.HANDLE, wintypes.DWORD]
    me = k.GetCurrentProcess()
    st = State(1, 0x1 | 0x4, 0)  # EXECUTION_SPEED + IGNORE_TIMER_RESOLUTION: nicht drosseln
    k.SetProcessInformation(me, 4, ctypes.byref(st), ctypes.sizeof(st))  # 4 = ProcessPowerThrottling
    k.SetPriorityClass(me, 0x8000)  # ABOVE_NORMAL_PRIORITY_CLASS


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8798)
    ap.add_argument("--token-file", required=True)
    ap.add_argument("--parent-pid", type=int, default=0)
    a = ap.parse_args()
    if os.name == "nt":
        try:
            no_power_throttling()
        except Exception as e:
            print("Drosselschutz:", e, file=sys.stderr)
    prune_cache()
    srv = ThreadingHTTPServer(("127.0.0.1", a.port), Handler)
    srv.token_file = a.token_file
    if a.parent_pid and os.name == "nt":
        threading.Thread(target=watch_parent, args=(a.parent_pid,), daemon=True).start()
    threading.Thread(target=load_model, daemon=True).start()
    srv.serve_forever()


if __name__ == "__main__":
    main()
