@echo off
cd /d "%~dp0"
echo Iniciando SurcoVisor...
set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE_EXE%" (
  echo No se encuentra Node.js en la instalacion de Codex.
  pause
  exit /b 1
)
"%NODE_EXE%" node_modules\vite\bin\vite.js --host 0.0.0.0 --port 5180
pause
