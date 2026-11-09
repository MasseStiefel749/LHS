# agent/bridge.ps1 – Lernhub <-> OpenCode Bridge (localhost:8799)
# Startet die App-Verbindung OHNE Admin-Rechte (TcpListener statt http.sys).
# Endpunkte:
#   GET  /ping    -> { ok, bridge, opencode, status }
#   GET  /status  -> content/status.json
#   POST /auftrag -> schreibt content/auftraege/<ts>-<typ>.md und startet opencode
#   POST /tipp    -> startet opencode (ohne Tools) fuer einen Lern-Tipp, liefert { id }
#   GET  /tipp?id -> { done, text }
#   POST /tts     -> MP3 einer Microsoft-Neural-Stimme (edge-tts, braucht Internet), sonst Fehler-JSON
# Chatterbox (lokale KI-Stimmen, optional): agent/tts_server.py auf 127.0.0.1:8798, startet automatisch,
#   wenn agent/chatterbox-installieren.ps1 einmal gelaufen ist. /ping meldet cbx=true.
# Sicherheit: POST braucht den Header X-Lernhub-Token. Der Token wird bei jedem Start neu
# erzeugt und nach content/bridge-token.js geschrieben (nur die lokale App liest ihn).
# Fremde Webseiten kennen ihn nicht und koennen so keine Auftraege einschleusen.
# Vollzugriff (typ "pc"): nur wenn die Bridge mit -Vollzugriff gestartet wurde UND der Auftrag
# am PC in einem Windows-Dialog bestaetigt wird (agent/vollzugriff.ps1).
param(
  [string]$ProjectDir = "",
  [switch]$NoAutoRun,        # kein automatischer opencode-Start
  [switch]$Vollzugriff,      # Agent darf auf Nachfrage Shell-Befehle und Dateien ausserhalb des Projekts nutzen
  [int]$Port = 8799
)
$ErrorActionPreference = "SilentlyContinue"
if (-not $ProjectDir) { $ProjectDir = Split-Path -Parent $PSScriptRoot }
# Windows zerlegt Pfade mit abschliessendem Backslash in Anfuehrungszeichen falsch ("...\lernhub\" -> ...\lernhub").
# Verbleibende Anfuehrungszeichen entfernen, sonst landen Token/Auftraege in einem nicht existierenden Ordner.
$ProjectDir = ("$ProjectDir" -replace '"', '').Trim()
if (-not (Test-Path -LiteralPath $ProjectDir -PathType Container)) { $ProjectDir = Split-Path -Parent $PSScriptRoot }
$ContentDir = Join-Path $ProjectDir "content"
$QueueDir = Join-Path $ContentDir "auftraege"
$StatusFile = Join-Path $ContentDir "status.json"
$ExtFile = Join-Path $ContentDir "erweiterungen.js"
$TokenFile = Join-Path $ContentDir "bridge-token.js"
New-Item -ItemType Directory -Force -Path $QueueDir | Out-Null

# Port zuerst belegen: laeuft schon eine Bridge, darf deren Token nicht ueberschrieben werden.
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
$listener.ExclusiveAddressUse = $true
try { $listener.Start() }
catch {
  Write-Host "Port $Port ist belegt - es laeuft schon eine Bridge. Erst das andere Bridge-Fenster schliessen." -ForegroundColor Red
  exit 1
}

$tokenBytes = New-Object byte[] 24
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($tokenBytes)
$Token = ($tokenBytes | ForEach-Object { $_.ToString("x2") }) -join ""
[System.IO.File]::WriteAllText($TokenFile, "window.LERNHUB_TOKEN=""$Token"";`n", [System.Text.UTF8Encoding]::new($false))

function Get-OpenCodeVersion {
  try {
    $v = & opencode --version 2>$null | Select-Object -First 1
    if ($v) { return "$v".Trim() }
  }
  catch {}
  return $null
}
$script:OcVer = Get-OpenCodeVersion
$script:OcAt = Get-Date
$script:RunProc = $null
$script:RunStart = [DateTime]::MinValue
$TipDir = Join-Path ([System.IO.Path]::GetTempPath()) "lernhub-tipps"
New-Item -ItemType Directory -Force -Path $TipDir | Out-Null
$script:Tips = @{}
$TtsDir = Join-Path ([System.IO.Path]::GetTempPath()) "lernhub-tts"
New-Item -ItemType Directory -Force -Path $TtsDir | Out-Null
Get-ChildItem -LiteralPath $TtsDir -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force
function Test-EdgeTts {
  try { & python -c "import edge_tts" 2>$null | Out-Null; return ($LASTEXITCODE -eq 0) } catch { return $false }
}
$script:TtsOk = Test-EdgeTts
$script:TtsAt = Get-Date

# Chatterbox (lokale KI-Stimmen): eigener Python-Server auf 8798, nur wenn chatterbox-installieren.ps1 gelaufen ist.
# Der Server beendet sich selbst, sobald diese Bridge nicht mehr laeuft (--parent-pid).
$CbxPy = Join-Path $env:LOCALAPPDATA "lernhub-tts\venv\Scripts\python.exe"
$CbxPort = 8798
$script:CbxProc = $null
$script:CbxAt = [DateTime]::MinValue
function Test-PortOpen([int]$p) {
  $c = New-Object System.Net.Sockets.TcpClient
  try { return $c.ConnectAsync("127.0.0.1", $p).Wait(300) } catch { return $false } finally { $c.Close() }
}
function Start-Chatterbox {
  if (-not (Test-Path -LiteralPath $CbxPy)) { return }
  if ($script:CbxProc -and -not $script:CbxProc.HasExited) { return }
  if (((Get-Date) - $script:CbxAt).TotalSeconds -lt 30) { return }
  $script:CbxAt = Get-Date
  if (Test-PortOpen $CbxPort) { return }
  try {
    $script:CbxProc = Start-Process -FilePath $CbxPy -ArgumentList "`"$(Join-Path $PSScriptRoot 'tts_server.py')`"", "--port", $CbxPort,
    "--token-file", "`"$TokenFile`"", "--parent-pid", $PID -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru
  }
  catch {}
}
Start-Chatterbox

# Text kommt ueber eine Datei (nie in die Kommandozeile); Stimme/Tempo/Tonhoehe sind vorher per Regex geprueft.
function Get-TtsAudio([string]$text, [string]$voice, [string]$rate, [string]$pitch) {
  $sha = [System.Security.Cryptography.SHA256]::Create()
  $key = ($sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes("$voice|$rate|$pitch|$text")) | ForEach-Object { $_.ToString("x2") }) -join ""
  $mp3 = Join-Path $TtsDir "$key.mp3"
  if ((Test-Path -LiteralPath $mp3) -and (Get-Item -LiteralPath $mp3).Length -gt 0) { return , [System.IO.File]::ReadAllBytes($mp3) }
  $inF = Join-Path $TtsDir "$key.txt"
  [System.IO.File]::WriteAllText($inF, $text, [System.Text.UTF8Encoding]::new($false))
  try {
    $p = Start-Process -FilePath "python" -ArgumentList "-m", "edge_tts", "--voice", $voice, "--rate=$rate", "--pitch=$pitch",
    "--file", "`"$inF`"", "--write-media", "`"$mp3`"" -WorkingDirectory $TtsDir -WindowStyle Hidden -PassThru
    if (-not $p.WaitForExit(20000)) { try { & taskkill /PID $p.Id /T /F 2>$null | Out-Null } catch {} }
  }
  catch {}
  Remove-Item -LiteralPath $inF -Force
  if ((Test-Path -LiteralPath $mp3) -and (Get-Item -LiteralPath $mp3).Length -gt 0) { return , [System.IO.File]::ReadAllBytes($mp3) }
  Remove-Item -LiteralPath $mp3 -Force
  return $null
}

# Prompt kommt ueber stdin (nie in die Kommandozeile); Arbeitsordner ausserhalb des Projekts, alle Tools gesperrt.
function Start-Tip([string]$prompt) {
  if (-not (Get-OpenCodeVersion)) { return $null }
  foreach ($k in @($script:Tips.Keys)) {
    if ((Get-Date) - $script:Tips[$k].start -gt [TimeSpan]::FromMinutes(10)) { $script:Tips.Remove($k) }
  }
  if (@($script:Tips.Values | Where-Object { -not $_.proc.HasExited }).Count -ge 2) { return $null }
  $id = (Get-Date -Format "yyyyMMdd-HHmmss-fff")
  $inF = Join-Path $TipDir "$id.in.txt"; $outF = Join-Path $TipDir "$id.out.txt"; $errF = Join-Path $TipDir "$id.err.txt"
  [System.IO.File]::WriteAllText($inF, $prompt, [System.Text.UTF8Encoding]::new($false))
  $oldPerm = $env:OPENCODE_PERMISSION
  $env:OPENCODE_PERMISSION = '{"edit":"deny","bash":"deny","webfetch":"deny","external_directory":"deny"}'
  try {
    $p = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "opencode", "run" -WorkingDirectory $TipDir `
      -RedirectStandardInput $inF -RedirectStandardOutput $outF -RedirectStandardError $errF -WindowStyle Hidden -PassThru
  }
  catch { $p = $null }
  finally { $env:OPENCODE_PERMISSION = $oldPerm }
  if (-not $p) { return $null }
  $script:Tips[$id] = @{ proc = $p; start = Get-Date; out = $outF }
  return $id
}

function Read-Headers($s) {
  $buf = New-Object System.Collections.Generic.List[byte]
  while ($true) {
    $b = $s.ReadByte(); if ($b -lt 0) { break }
    $buf.Add([byte]$b)
    if ($buf.Count -gt 16384) { break }
    if ($buf.Count -ge 4) {
      $n = $buf.Count
      if ($buf[$n - 4] -eq 13 -and $buf[$n - 3] -eq 10 -and $buf[$n - 2] -eq 13 -and $buf[$n - 1] -eq 10) { break }
    }
  }
  return [System.Text.Encoding]::ASCII.GetString($buf.ToArray())
}
function Read-Exact($s, [int]$n) {
  $arr = New-Object byte[] $n; $off = 0
  while ($off -lt $n) { $r = $s.Read($arr, $off, $n - $off); if ($r -le 0) { break }; $off += $r }
  return , $arr
}
function Send-Bytes($s, [byte[]]$head, [byte[]]$body) {
  $s.Write($head, 0, $head.Length)
  if ($body -and $body.Length -gt 0) { $s.Write($body, 0, $body.Length) }
  $s.Flush()
}
function Send-Json($s, $obj, [int]$code = 200) {
  $json = $obj | ConvertTo-Json -Depth 8 -Compress
  $body = if ($code -eq 204) { New-Object byte[] 0 } else { [System.Text.Encoding]::UTF8.GetBytes($json) }
  $statusText = switch ($code) { 200 { "OK" } 204 { "No Content" } 400 { "Bad Request" } 403 { "Forbidden" } 404 { "Not Found" } 413 { "Payload Too Large" } default { "Error" } }
  $headStr = "HTTP/1.1 $code $statusText`r`n" +
  "Content-Type: application/json; charset=utf-8`r`n" +
  "Content-Length: $($body.Length)`r`n" +
  "Access-Control-Allow-Origin: *`r`n" +
  "Access-Control-Allow-Headers: Content-Type, X-Lernhub-Token`r`n" +
  "Access-Control-Allow-Methods: GET, POST, OPTIONS`r`n" +
  "Cache-Control: no-store`r`n" +
  "Connection: close`r`n`r`n"
  Send-Bytes $s ([System.Text.Encoding]::ASCII.GetBytes($headStr)) $body
}
function Send-Audio($s, [byte[]]$body) {
  $headStr = "HTTP/1.1 200 OK`r`n" +
  "Content-Type: audio/mpeg`r`n" +
  "Content-Length: $($body.Length)`r`n" +
  "Access-Control-Allow-Origin: *`r`n" +
  "Access-Control-Allow-Headers: Content-Type, X-Lernhub-Token`r`n" +
  "Access-Control-Allow-Methods: GET, POST, OPTIONS`r`n" +
  "Cache-Control: no-store`r`n" +
  "Connection: close`r`n`r`n"
  Send-Bytes $s ([System.Text.Encoding]::ASCII.GetBytes($headStr)) $body
}
function Get-StatusObj {
  try {
    if (Test-Path $StatusFile) {
      $raw = [System.IO.File]::ReadAllText($StatusFile, [System.Text.Encoding]::UTF8)
      return $raw | ConvertFrom-Json
    }
  }
  catch {}
  return [pscustomobject]@{ lastRun = $null; queue = @(); error = $null }
}
function Test-RunBusy {
  if ($script:RunProc -and -not $script:RunProc.HasExited) {
    if (((Get-Date) - $script:RunStart).TotalMinutes -lt 20) { return $true }
  }
  return $false
}
function Start-AgentRun([string]$fileName, [string]$vault, [string]$typ) {
  if ($NoAutoRun) { return $false }
  if (-not (Get-OpenCodeVersion)) { return $false }
  if (Test-RunBusy) { return $false }
  if ($typ -eq "pc") {
    try {
      $script:RunProc = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$(Join-Path $PSScriptRoot 'vollzugriff.ps1')`"",
      "-ProjectDir", "`"$ProjectDir`"", "-FileName", $fileName `
        -WorkingDirectory $ProjectDir -WindowStyle Normal -PassThru
      $script:RunStart = Get-Date
      return $true
    }
    catch { return $false }
  }
  # Vault ausserhalb des Projekts: nur dieser Ordner wird fuer opencode freigegeben (Lesen).
  if ($vault -and (Test-Path -LiteralPath $vault -PathType Container)) {
    $pattern = (($vault -replace '\\', '/').TrimEnd('/')) + '/**'
    $env:OPENCODE_PERMISSION = (@{ external_directory = @{ $pattern = 'allow' } } | ConvertTo-Json -Compress -Depth 4)
  }
  # Prompt bewusst ohne Anfuehrungszeichen/Umlaute (Batch-Quoting + Codepage)
  $prompt = "Bearbeite die neue Auftragsdatei content/auftraege/$fileName nach den Regeln in AGENT.md. " +
  "Schreibe Ergebnisse nach content/erweiterungen.js und aktualisiere content/status.json."
  try {
    $script:RunProc = Start-Process -FilePath "cmd.exe" `
      -ArgumentList "/c", "opencode", "run", "`"$prompt`"" `
      -WorkingDirectory $ProjectDir -WindowStyle Minimized -PassThru
    $script:RunStart = Get-Date
    return $true
  }
  catch { return $false }
}

Write-Host "Lernhub-Bridge laeuft auf http://127.0.0.1:$Port  (Projekt: $ProjectDir)"
Write-Host "OpenCode: $(if ($script:OcVer) { $script:OcVer } else { 'nicht gefunden - opencode-verbinden.cmd installiert es' })"
Write-Host "Fenster offen lassen, solange die App verbunden sein soll. Schliessen = Trennen."
if ($Vollzugriff) { Write-Host "VOLLZUGRIFF ist AN: PC-Auftraege aus der App muessen trotzdem jedes Mal hier am PC bestaetigt werden." -ForegroundColor Yellow }

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $stream.ReadTimeout = 5000
    $raw = Read-Headers $stream
    if (-not $raw) { continue }
    $lines = $raw -split "`r`n"
    $reqLine = $lines[0] -split " "
    $method = $reqLine[0]; $path = ($reqLine[1] -split "\?")[0]
    $query = if ($reqLine[1] -match "\?(.*)$") { $Matches[1] } else { "" }
    $headers = @{}
    foreach ($l in ($lines | Select-Object -Skip 1)) {
      $i = $l.IndexOf(":")
      if ($i -gt 0) { $headers[$l.Substring(0, $i).Trim().ToLower()] = $l.Substring($i + 1).Trim() }
    }
    # Gegen DNS-Rebinding: nur Anfragen an localhost/127.0.0.1 akzeptieren
    if ($headers["host"] -notmatch '^(127\.0\.0\.1|localhost)(:\d+)?$') {
      Send-Json $stream ([pscustomobject]@{ ok = $false; error = "host" }) 403; continue
    }

    if ($method -eq "OPTIONS") { Send-Json $stream ([pscustomobject]@{ ok = $true }) 204; continue }

    if ($method -eq "GET" -and $path -eq "/ping") {
      # opencode --version dauert; nur jede Minute neu pruefen, sonst laufen App-Pings in den Timeout
      if (-not $script:OcVer -or ((Get-Date) - $script:OcAt).TotalSeconds -gt 60) { $script:OcVer = Get-OpenCodeVersion; $script:OcAt = Get-Date }
      if (-not $script:TtsOk -and ((Get-Date) - $script:TtsAt).TotalSeconds -gt 60) { $script:TtsOk = Test-EdgeTts; $script:TtsAt = Get-Date }
      Start-Chatterbox
      Send-Json $stream ([pscustomobject]@{
          ok = $true; bridge = "1.4"; opencode = $script:OcVer; full = [bool]$Vollzugriff; tipp = $true; tts = $script:TtsOk
          cbx = [bool](Test-Path -LiteralPath $CbxPy)
          status = Get-StatusObj; running = (Test-RunBusy)
        }); continue
    }
    if ($method -eq "GET" -and $path -eq "/status") {
      Send-Json $stream (Get-StatusObj); continue
    }
    if ($method -eq "POST" -and $path -eq "/tipp") {
      $len = 0
      if ($headers.ContainsKey("content-length")) { [void][int]::TryParse($headers["content-length"], [ref]$len) }
      if ($len -gt 20000) { Send-Json $stream ([pscustomobject]@{ ok = $false; error = "zu gross" }) 413; continue }
      $bodyBytes = if ($len -gt 0) { Read-Exact $stream $len } else { New-Object byte[] 0 }
      if ($headers["x-lernhub-token"] -ne $Token) {
        Send-Json $stream ([pscustomobject]@{ ok = $false; error = "token" }) 403; continue
      }
      $payload = $null
      try { $payload = [System.Text.Encoding]::UTF8.GetString($bodyBytes) | ConvertFrom-Json } catch {}
      $prompt = "$($payload.prompt)"
      if (-not $prompt) { Send-Json $stream ([pscustomobject]@{ ok = $false; error = "kein prompt" }) 400; continue }
      if ($prompt.Length -gt 6000) { $prompt = $prompt.Substring(0, 6000) }
      $id = Start-Tip $prompt
      if (-not $id) { Send-Json $stream ([pscustomobject]@{ ok = $false; error = "busy" }); continue }
      Send-Json $stream ([pscustomobject]@{ ok = $true; id = $id }); continue
    }
    if ($method -eq "GET" -and $path -eq "/tipp") {
      $id = if ($query -match '(?:^|&)id=(\d{8}-\d{6}-\d{3})(?:&|$)') { $Matches[1] } else { "" }
      $t = if ($id) { $script:Tips[$id] } else { $null }
      if (-not $t) { Send-Json $stream ([pscustomobject]@{ ok = $false; error = "unbekannt" }) 404; continue }
      if (-not $t.proc.HasExited) {
        if ((Get-Date) - $t.start -gt [TimeSpan]::FromMinutes(3)) {
          try { & taskkill /PID $t.proc.Id /T /F 2>$null | Out-Null } catch {}
          $script:Tips.Remove($id)
          Send-Json $stream ([pscustomobject]@{ ok = $true; done = $true; text = ""; error = "timeout" }); continue
        }
        Send-Json $stream ([pscustomobject]@{ ok = $true; done = $false }); continue
      }
      $text = ""
      try { $text = [System.IO.File]::ReadAllText($t.out, [System.Text.Encoding]::UTF8) } catch {}
      $text = ($text -replace "\x1b\[[0-9;?]*[A-Za-z]", "").Trim()
      if ($text.Length -gt 6000) { $text = $text.Substring(0, 6000) }
      Get-ChildItem -LiteralPath $TipDir -Filter "$id.*" | Remove-Item -Force
      $script:Tips.Remove($id)
      Send-Json $stream ([pscustomobject]@{ ok = $true; done = $true; text = $text }); continue
    }
    if ($method -eq "POST" -and $path -eq "/tts") {
      $len = 0
      if ($headers.ContainsKey("content-length")) { [void][int]::TryParse($headers["content-length"], [ref]$len) }
      if ($len -gt 8000) { Send-Json $stream ([pscustomobject]@{ ok = $false; error = "zu gross" }) 413; continue }
      $bodyBytes = if ($len -gt 0) { Read-Exact $stream $len } else { New-Object byte[] 0 }
      if ($headers["x-lernhub-token"] -ne $Token) {
        Send-Json $stream ([pscustomobject]@{ ok = $false; error = "token" }) 403; continue
      }
      $payload = $null
      try { $payload = [System.Text.Encoding]::UTF8.GetString($bodyBytes) | ConvertFrom-Json } catch {}
      $text = "$($payload.text)".Trim(); $voice = "$($payload.voice)"; $rate = "$($payload.rate)"; $pitch = "$($payload.pitch)"
      if ($text.Length -gt 1500) { $text = $text.Substring(0, 1500) }
      if (-not $text -or $voice -cnotmatch '^[a-z]{2}-[A-Z]{2}-[A-Za-z]+Neural$' -or $rate -cnotmatch '^[+-]\d{1,2}%$' -or $pitch -cnotmatch '^[+-]\d{1,3}Hz$') {
        Send-Json $stream ([pscustomobject]@{ ok = $false; error = "ungueltig" }) 400; continue
      }
      if (-not $script:TtsOk) { Send-Json $stream ([pscustomobject]@{ ok = $false; error = "edge-tts fehlt" }) 404; continue }
      $audio = Get-TtsAudio $text $voice $rate $pitch
      if (-not $audio) { Send-Json $stream ([pscustomobject]@{ ok = $false; error = "tts fehlgeschlagen" }) 500; continue }
      Send-Audio $stream $audio; continue
    }
    if ($method -eq "POST" -and $path -eq "/auftrag") {
      # Body immer zuerst lesen: wuerde der Server antworten und schliessen, ohne den Body zu lesen, bekaeme der Browser einen TCP-Reset statt der 403.
      $len = 0
      if ($headers.ContainsKey("content-length")) { [void][int]::TryParse($headers["content-length"], [ref]$len) }
      if ($len -gt 200000) { Send-Json $stream ([pscustomobject]@{ ok = $false; error = "zu gross" }) 413; continue }
      $bodyBytes = if ($len -gt 0) { Read-Exact $stream $len } else { New-Object byte[] 0 }
      if ($headers["x-lernhub-token"] -ne $Token) {
        Send-Json $stream ([pscustomobject]@{ ok = $false; error = "token" }) 403; continue
      }
      $bodyText = [System.Text.Encoding]::UTF8.GetString($bodyBytes)
      $payload = $null
      try { $payload = $bodyText | ConvertFrom-Json } catch {}
      if (-not $payload) { Send-Json $stream ([pscustomobject]@{ ok = $false; error = "kein JSON" }) 400; continue }

      $safeTyp = if ("$($payload.typ)" -in @("aufgaben", "pruefung", "sprache", "vault", "frei", "pc")) { "$($payload.typ)" } else { "frei" }
      if ($safeTyp -eq "pc" -and -not $Vollzugriff) {
        Send-Json $stream ([pscustomobject]@{ ok = $false; error = "vollzugriff aus" }) 403; continue
      }
      $ts = Get-Date -Format "yyyyMMdd-HHmmss"
      $fileName = "$ts-$safeTyp.md"
      $text = "$($payload.text)"
      if ($text.Length -gt 4000) { $text = $text.Substring(0, 4000) }
      $fileBody = "typ: $safeTyp`nts: $([DateTime]::UtcNow.ToString('o'))`nerledigt: nein`n`n$text`n"
      [System.IO.File]::WriteAllText((Join-Path $QueueDir $fileName), $fileBody, [System.Text.UTF8Encoding]::new($false))

      $spawned = Start-AgentRun $fileName "$($payload.vault)" $safeTyp
      Send-Json $stream ([pscustomobject]@{ ok = $true; file = $fileName; spawned = $spawned })
      continue
    }
    Send-Json $stream ([pscustomobject]@{ ok = $false; error = "unbekannt" }) 404
  }
  catch {
    try { Send-Json $stream ([pscustomobject]@{ ok = $false; error = "$_" }) 500 } catch {}
  }
  finally {
    try { $client.Close() } catch {}
  }
}
