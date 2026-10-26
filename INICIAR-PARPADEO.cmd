@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar-parpadeo.ps1"
if errorlevel 1 pause
