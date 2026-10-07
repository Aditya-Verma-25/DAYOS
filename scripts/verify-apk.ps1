$apkPath = "C:\Users\LENOVO\.gemini\antigravity\scratch\dayos\android\app\build\outputs\apk\debug\app-debug.apk"
$apk = Get-Item $apkPath
$sizeMb = [System.Math]::Round($apk.Length / 1048576, 2)

Write-Host "APK_EXISTS: $($apk.Exists)"
Write-Host "APK_PATH: $($apk.FullName)"
Write-Host "APK_SIZE_BYTES: $($apk.Length)"
Write-Host "APK_SIZE_MB: $sizeMb MB"
Write-Host "APK_LAST_MODIFIED: $($apk.LastWriteTime)"
