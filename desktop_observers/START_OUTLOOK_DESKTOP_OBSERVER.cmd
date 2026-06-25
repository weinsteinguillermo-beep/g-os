@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0outlook_desktop_observer.ps1" -IntervalSeconds 30
