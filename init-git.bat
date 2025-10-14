@echo off
echo ========================================
echo  Инициализация Git репозитория
echo ========================================
echo.

echo Введите ваш GitHub username (например: ivanov123):
set /p USERNAME=

echo.
echo Введите название репозитория (по умолчанию: binance-alpha-bnb):
set /p REPONAME=
if "%REPONAME%"=="" set REPONAME=binance-alpha-bnb

echo.
echo ========================================
echo Инициализация...
echo ========================================

git init
git add .
git commit -m "Initial commit: Binance Alpha BNB Chain tracker"
git branch -M main
git remote add origin https://github.com/%USERNAME%/%REPONAME%.git

echo.
echo ========================================
echo Готово!
echo ========================================
echo.
echo Теперь выполните команду для загрузки кода:
echo.
echo     git push -u origin main
echo.
echo После этого следуйте инструкциям в DEPLOY_GUIDE.md
echo.
pause
