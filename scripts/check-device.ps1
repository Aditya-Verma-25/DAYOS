$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adb)) {
    $adb = "C:\Users\LENOVO\AppData\Local\Microsoft\WinGet\Packages\Google.PlatformTools_Microsoft.Winget.Source_8wekyb3d8bbwe\platform-tools\adb.exe"
}

$apkPath = "C:\Users\LENOVO\.gemini\antigravity\scratch\dayos\android\app\build\outputs\apk\debug\app-debug.apk"

Write-Host "Running adb devices using: $adb"
$devicesOutput = & $adb devices
Write-Host $devicesOutput

# Parse devices
$lines = $devicesOutput -split "`r?`n" | Where-Object { $_ -match "\S" -and $_ -notmatch "List of devices" }

if ($lines.Count -gt 0) {
    Write-Host "Found connected device(s):"
    $lines | ForEach-Object { Write-Host " - $_" }
    
    Write-Host "Installing APK to connected device..."
    & $adb install -r $apkPath
    
    Write-Host "Launching DAYOS on device..."
    & $adb shell am start -n com.adityaverma.dayos/.MainActivity
    Write-Host "DAYOS launched on device!"
} else {
    Write-Host "NO_DEVICE_CONNECTED: No active Android device detected via USB debugging."
}
