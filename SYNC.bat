@echo off
cd /d "%~dp0"
echo ==== SYNC2 %date% %time% ==== >> deploy_log.txt
del /s /q ".git\*.lock" >nul 2>&1
git add -A 2>nul
git -c user.email=loucospelobem2019@gmail.com -c user.name="Eduardo Jorge" commit -m "Sync antes do rebase" >> deploy_log.txt 2>&1
git -c user.email=loucospelobem2019@gmail.com -c user.name="Eduardo Jorge" pull --rebase --autostash origin master >> deploy_log.txt 2>&1
git push origin master >> deploy_log.txt 2>&1
echo ==== FIM SYNC2 ==== >> deploy_log.txt
