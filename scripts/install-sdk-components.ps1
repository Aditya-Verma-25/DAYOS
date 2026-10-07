$ErrorActionPreference = "Stop"

$sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $sdkRoot
$sdkmanager = "$sdkRoot\cmdline-tools\latest\bin\sdkmanager.bat"

Write-Host "Installing platform-tools and build-tools via sdkmanager..."
$yesInput = ("y`n" * 30)
$yesInput | & $sdkmanager --sdk_root=$sdkRoot "platform-tools" "build-tools;34.0.0" "platforms;android-34"

Write-Host "SDK components installed successfully!"
