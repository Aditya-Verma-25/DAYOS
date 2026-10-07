$sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $sdkRoot
$sdkmanager = "$sdkRoot\cmdline-tools\latest\bin\sdkmanager.bat"

Write-Host "Installing platforms;android-35 and build-tools;35.0.0..."
$yesInput = ("y`n" * 30)
$yesInput | & $sdkmanager --sdk_root=$sdkRoot "platforms;android-35" "build-tools;35.0.0"

Write-Host "Checking platforms;android-36..."
try {
    $yesInput | & $sdkmanager --sdk_root=$sdkRoot "platforms;android-36"
} catch {
    Write-Host "platforms;android-36 not available"
}

Write-Host "Done!"
