@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0extract-approved-target-images.ps1" %*
endlocal
