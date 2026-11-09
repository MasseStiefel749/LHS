# agent/vollzugriff.ps1 - fuehrt EINEN PC-Auftrag mit Vollzugriff aus, aber nur nach Bestaetigung am PC.
# Wird von bridge.ps1 gestartet (nur wenn die Bridge mit -Vollzugriff laeuft).
# Der Windows-Dialog kann von keiner Webseite geklickt werden: ohne "Ja" passiert nichts.
param(
    [Parameter(Mandatory = $true)][string]$ProjectDir,
    [Parameter(Mandatory = $true)][string]$FileName
)
$ErrorActionPreference = "Stop"
$host.UI.RawUI.WindowTitle = "Lernhub-Agent - Vollzugriff"
if ($FileName -notmatch '^\d{8}-\d{6}-pc\.md$') { exit 2 }
$file = Join-Path $ProjectDir "content\auftraege\$FileName"
$text = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
$shown = if ($text.Length -gt 1500) { $text.Substring(0, 1500) + " ..." } else { $text }

Add-Type -AssemblyName System.Windows.Forms
$owner = New-Object System.Windows.Forms.Form -Property @{ TopMost = $true }
$msg = "Der Lernhub-Agent moechte mit VOLLZUGRIFF auf diesem PC arbeiten:`n" +
"Befehle ausfuehren, Programme installieren, Dateien ueberall lesen und aendern, ins Internet.`n`n" +
"Auftrag:`n$shown`n`nNur zulassen, wenn du diesen Auftrag gerade selbst geschickt hast."
$answer = [System.Windows.Forms.MessageBox]::Show($owner, $msg, "Lernhub - Vollzugriff bestaetigen", "YesNo", "Warning", "Button2")
$owner.Dispose()
if ("$answer" -ne "Yes") {
    [System.IO.File]::WriteAllText($file, ($text -replace '(?m)^erledigt: nein', 'erledigt: abgelehnt'), [System.Text.UTF8Encoding]::new($false))
    exit 1
}

# Gilt nur fuer diesen Prozess und hebt das bash-Verbot aus opencode.json fuer genau diesen Lauf auf.
$env:OPENCODE_PERMISSION = '{"bash":"allow","edit":"allow","webfetch":"allow","external_directory":"allow"}'
$prompt = "Bearbeite die Auftragsdatei content/auftraege/$FileName nach Abschnitt 7 (Vollzugriff) in AGENT.md. " +
"Du darfst fuer diesen Auftrag Shell-Befehle ausfuehren und Dateien auf diesem PC lesen und aendern. " +
"Tu nur, was der Auftrag verlangt, und aktualisiere am Ende content/status.json."
Set-Location -LiteralPath $ProjectDir
Write-Host "Vollzugriff bestaetigt - OpenCode arbeitet. Hier siehst du jeden Schritt." -ForegroundColor Yellow
Write-Host "Abbrechen: Strg+C oder dieses Fenster schliessen.`n"
& opencode run $prompt
Write-Host "`nFertig. Fenster schliessen oder Enter druecken." -ForegroundColor Green
[void](Read-Host)
