@echo off
cd /d "C:\Users\chika\Desktop\1C\rosautoasia"
set ODATA_USER=Павел
set ODATA_PASSWORD=andrei2010
set ODATA_URL=http://localhost/unf/odata/standard.odata

echo [%date% %time%] ===== Starting sync ===== >> sync\sync.log

echo [%date% %time%] Syncing products... >> sync\sync.log
node sync\odata-sync.js >> sync\sync.log 2>&1

echo [%date% %time%] Syncing orders... >> sync\sync.log
node sync\sync-orders.js >> sync\sync.log 2>&1

echo [%date% %time%] ===== Sync complete ===== >> sync\sync.log
echo. >> sync\sync.log
