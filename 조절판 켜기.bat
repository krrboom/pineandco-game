@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo.
echo   Pine 조절판을 켭니다.
echo.

rem 게임을 고쳤을 수 있으니 조절판을 최신으로 다시 만든다
node make-tune.js
if errorlevel 1 (
  echo.
  echo   조절판 만들기에 실패했습니다. 클로드에게 알려주세요.
  pause
  exit /b 1
)

echo.
echo   ============================================
echo     이 컴퓨터에서    http://localhost:5603/tune.html
echo     휴대폰에서       http://192.168.0.103:5603/tune.html
echo   ============================================
echo.
echo   휴대폰은 이 컴퓨터와 같은 와이파이에 있어야 합니다.
echo   끝내려면 이 창에서 Ctrl+C 를 누르거나 창을 닫으세요.
echo.

start "" http://localhost:5603/tune.html
npx http-server -p 5603 -c-1 --silent
