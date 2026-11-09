# agent/chatterbox-installieren.ps1 – richtet Chatterbox (lokale KI-Stimmen, Resemble AI, MIT-Lizenz) ein.
# Eigene Python-Umgebung unter %LOCALAPPDATA%\lernhub-tts\venv, damit die festen Paketversionen nichts anderes stoeren.
# Laedt einmalig ca. 6 GB (PyTorch + Modell). Danach startet die Bridge den Stimmen-Server automatisch.
$Base = Join-Path $env:LOCALAPPDATA "lernhub-tts"
$Venv = Join-Path $Base "venv"
$Py = Join-Path $Venv "Scripts\python.exe"
New-Item -ItemType Directory -Force -Path $Base | Out-Null

function Step([string]$msg) { Write-Host "`n== $msg ==" -ForegroundColor Cyan }
function Check([string]$what) { if ($LASTEXITCODE -ne 0) { Write-Host "FEHLER bei: $what" -ForegroundColor Red; exit 1 } }

if (-not (Test-Path $Py)) {
    Step "Python-Umgebung anlegen"
    & py -3.12 -m venv $Venv; Check "venv (Python 3.12 noetig)"
}
Step "pip aktualisieren"
& $Py -m pip install --upgrade pip --disable-pip-version-check; Check "pip"

$cuda = [bool](Get-Command nvidia-smi -ErrorAction SilentlyContinue)
$index = if ($cuda) { "https://download.pytorch.org/whl/cu124" } else { "https://download.pytorch.org/whl/cpu" }
Step "PyTorch 2.6 installieren ($(if ($cuda) { 'NVIDIA-Grafikkarte' } else { 'nur CPU - langsam' }))"
& $Py -m pip install torch==2.6.0 torchaudio==2.6.0 --index-url $index --disable-pip-version-check; Check "PyTorch"

Step "Chatterbox installieren"
& $Py -m pip install chatterbox-tts edge-tts --disable-pip-version-check; Check "chatterbox-tts"

Step "Modell herunterladen und testen"
& $Py -c "import torch; from chatterbox.mtl_tts import ChatterboxMultilingualTTS as M; d='cuda' if torch.cuda.is_available() else 'cpu'; M.from_pretrained(device=d); print('OK', torch.__version__, d)"; Check "Modell"

Write-Host "`nFertig. Bridge neu starten, dann in Lernhub: Einstellungen -> Sprachmodell -> Chatterbox." -ForegroundColor Green
