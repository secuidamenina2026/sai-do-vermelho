@echo off
cd /d "%~dp0"
echo ==== SYNC4 %date% %time% ==== >> sync_log.txt
rmdir /s /q ".git\rebase-merge" >nul 2>&1
rmdir /s /q ".git\rebase-apply" >nul 2>&1
del /s /q ".git\*.lock" >nul 2>&1
git add -A >nul 2>&1
git -c user.email=loucospelobem2019@gmail.com -c user.name="Eduardo Jorge" commit -m "Sync" >> sync_log.txt 2>&1
git -c user.email=loucospelobem2019@gmail.com -c user.name="Eduardo Jorge" pull --rebase --autostash origin master >> sync_log.txt 2>&1
git push origin master >> sync_log.txt 2>&1
echo ==== FIM SYNC4 ==== >> sync_log.txt
