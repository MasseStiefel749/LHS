@echo off
setlocal EnableExtensions
title Lernhub x OpenCode
cd /d "%~dp0"
echo.
echo  ================================================
echo   Lernhub - OpenCode Agent verbinden
echo  ================================================
echo.

REM --- 1) OpenCode vorhanden? Falls nicht: ueber npm installieren ---
where opencode >nul 2>nul
if %errorlevel%==0 goto :found

echo  [1/3] OpenCode nicht gefunden - wird installiert (npm) ...
where npm >nul 2>nul
if not %errorlevel%==0 (
  echo.
  echo  FEHLER: npm nicht gefunden. Bitte zuerst Node.js installieren:
  echo          https://nodejs.org  -  dann dieses Skript nochmal starten.
  echo.
  echo  Alternative mit Git-Bash:
  echo          curl -fsSL https://opencode.ai/v2/install ^| bash
  echo.
  pause
  exit /b 1
)
call npm install -g opencode-ai
where opencode >nul 2>nul
if not %errorlevel%==0 (
  echo.
  echo  FEHLER: Installation fehlgeschlagen. Bitte manuell pruefen:
  echo          npm install -g opencode-ai
  echo.
  pause
  exit /b 1
)
:found
for /f "delims=" %%v in ('opencode --version 2^>nul') do set "OCVER=%%v"
echo  [2/3] OpenCode bereit: %OCVER%
echo.

REM --- 2) Bridge starten (Pruefen ob schon eine laeuft) ---
set "BRIDGE_RUNNING="
powershell -NoProfile -Command "try { $c = Test-NetConnection -ComputerName 127.0.0.1 -Port 8799 -WarningAction SilentlyContinue; if ($c.TcpTestSucceeded) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>nul
if not %errorlevel%==0 goto :startbridge
echo  [3/3] Bridge laeuft bereits. Vollzugriff aendern: Bridge-Fenster schliessen und dieses Skript neu starten.
goto :bridgeok

:startbridge
echo.
echo  VOLLZUGRIFF: Darf der Agent auf Wunsch ALLES auf diesem PC tun
echo  (Befehle ausfuehren, Programme installieren, Dateien ueberall aendern)?
echo  Jeder solche Auftrag muss trotzdem einzeln am PC bestaetigt werden.
set "FULLFLAG="
choice /C JN /N /T 30 /D N /M "  Vollzugriff erlauben? [J/N] (Standard N) "
if not errorlevel 2 set "FULLFLAG=-Vollzugriff"
echo  [3/3] Starte Bridge auf http://127.0.0.1:8799 ...
start "Lernhub-Bridge (offen lassen)" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0agent\bridge.ps1" %FULLFLAG%
timeout /t 2 /nobreak >nul

:bridgeok

echo.
echo  ================================================
echo   Fertig! So geht es weiter:
echo   1. Diese Bridge-Fenster offen lassen (gruener Punkt in der App).
echo   2. App oeffnen und im Agent-Panel Auftraege schicken.
echo   3. Oder manuell: "opencode" in diesem Ordner starten und
echo      den Verbindungs-Prompt aus der App einfuegen.
echo  ================================================
echo.

REM --- 3) Optional: OpenCode sofort mit Verbindungsprompt starten ---
choice /C JN /N /M "  OpenCode JETZT mit Verbindungsprompt starten? [J/N] "
if errorlevel 2 goto :noboot
start "OpenCode - Lernhub-Agent" cmd /k opencode run "Verbinde dich mit der Lernhub-App in diesem Ordner: Lies zuerst AGENT.md und befolge sie genau. Pruefe content/status.json und content/auftraege/ und bearbeite offene Auftraege."
:noboot
echo.
pause
exit /b 0
