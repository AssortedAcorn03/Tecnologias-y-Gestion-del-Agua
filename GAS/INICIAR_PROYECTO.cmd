@echo off
cd /d "%~dp0backend"
echo Iniciando backend desde %CD%
dotnet run --project backend.csproj
pause
