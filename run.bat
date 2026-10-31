@echo off
title Cozy Next.js 3D Workspace
cd /d "%~dp0"
echo ========================================================
echo       COZY NEXT.JS 3D AGENT WORKSPACE (PORT 3000)
echo ========================================================
echo Starting Next.js App Router on http://localhost:3000 ...
echo Telemetry listener active on POST http://localhost:3000/api/events
echo.
bun run dev
pause
