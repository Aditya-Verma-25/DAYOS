$ErrorActionPreference = "Stop"

$sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
$zipUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$tempZip = "$env:TEMP\cmdline-tools.zip"
$tempExtract = "$env:TEMP\cmdline-tools-extracted"

Write-Host "Setting up Android SDK at: $sdkRoot"

if (-not (Test-Path $sdkRoot)) {
    New-Item -ItemType Directory -Path $sdkRoot -Force | Out-Null
}

$cmdlineLatest = "$sdkRoot\cmdline-tools\latest"

if (-not (Test-Path "$cmdlineLatest\bin\sdkmanager.bat")) {
    Write-Host "Downloading Android Command-Line Tools (146 MB)..."
    curl.exe -L -o $tempZip $zipUrl

    Write-Host "Extracting Command-Line Tools with tar..."
    if (Test-Path $tempExtract) { Remove-Item -Recurse -Force $tempExtract }
    New-Item -ItemType Directory -Path $tempExtract -Force | Out-Null
    
    tar.exe -xf $tempZip -C $tempExtract

    New-Item -ItemType Directory -Path "$sdkRoot\cmdline-tools" -Force | Out-Null
    if (Test-Path $cmdlineLatest) { Remove-Item -Recurse -Force $cmdlineLatest }

    Move-Item -Path "$tempExtract\cmdline-tools" -Destination $cmdlineLatest -Force
    Remove-Item -Force $tempZip
    Remove-Item -Recurse -Force $tempExtract
    Write-Host "Command-Line Tools installed successfully at: $cmdlineLatest"
} else {
    Write-Host "Command-Line Tools already present at: $cmdlineLatest"
}

# Set environment variables for the current session and persistently for User
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkRoot, "User")
[System.Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $sdkRoot, "User")
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")

$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$cmdlineLatest\bin;$sdkRoot\platform-tools;$env:PATH"

Write-Host "JAVA_HOME set to: $env:JAVA_HOME"
Write-Host "ANDROID_HOME set to: $env:ANDROID_HOME"

# Accept all Android SDK licenses automatically
Write-Host "Accepting Android SDK licenses..."
$sdkmanager = "$cmdlineLatest\bin\sdkmanager.bat"
$yesInput = ("y`n" * 20)
$yesInput | & $sdkmanager --licenses --sdk_root=$sdkRoot | Out-Null

Write-Host "Android SDK setup complete!"
