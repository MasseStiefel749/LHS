@echo off
setlocal
title Lernhub - Live-Server
cd /d "%~dp0"
where node >nul 2>nul
if not %errorlevel%==0 (
  echo.
  echo  FEHLER: Node.js nicht gefunden. Bitte installieren: https://nodejs.org
  echo.
  pause
  exit /b 1
)
node dev-server.mjs --open
pause
