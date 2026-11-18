@echo off
title iKomers Cookies - Local Server
cd /d "%~dp0"
echo.
echo  Menjalankan server lokal iKomers Cookies...
echo  Browser akan terbuka otomatis di http://localhost:5500
echo.
start "" http://localhost:5500
node server.js
pause
