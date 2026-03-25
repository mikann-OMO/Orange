@echo off
echo Current directory: %CD%
echo Git status:
git status
echo.
echo Adding files...
git add .
echo.
echo Git status after add:
git status
echo.
echo Committing changes...
git commit -m "Update content"
echo.
echo Git log:
git log --oneline -5
echo.
echo Done!
pause