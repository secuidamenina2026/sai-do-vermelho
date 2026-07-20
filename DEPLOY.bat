@echo off
cd /d "%~dp0"
echo ==== DEPLOY SAI DO VERMELHO v2 ==== > deploy_log.txt
del /s /q ".git\*.lock" >nul 2>&1
git add -A >> deploy_log.txt 2>&1
git -c user.email=loucospelobem2019@gmail.com -c user.name="Eduardo Jorge" commit -m "Producao: correcoes completas" >> deploy_log.txt 2>&1
git push origin master >> deploy_log.txt 2>&1
echo ==== FIM ==== >> deploy_log.txt
echo.
echo PRONTO! Pode fechar esta janela.
pause
