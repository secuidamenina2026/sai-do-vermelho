@echo off
cd /d "%~dp0"
echo sync_log.txt>> .gitignore
echo SYNC.bat>> .gitignore
echo *.tar.gz>> .gitignore
echo ==== SYNC3 %date% %time% ==== >> sync_log.txt
del /s /q ".git\*.lock" >nul 2>&1
git rebase --abort >nul 2>&1
git add -A >nul 2>&1
git -c user.email=loucospelobem2019@gmail.com -c user.name="Eduardo Jorge" commit -m "Diagnostico gratuito + esteira de conversao" >> sync_log.txt 2>&1
git -c user.email=loucospelobem2019@gmail.com -c user.name="Eduardo Jorge" pull --rebase --autostash origin master >> sync_log.txt 2>&1
git push origin master >> sync_log.txt 2>&1
echo ==== FIM SYNC3 ==== >> sync_log.txt
