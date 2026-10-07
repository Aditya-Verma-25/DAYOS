$ErrorActionPreference = "Stop"

$targetDir = "C:\Users\LENOVO\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj"
$targetFile = "$targetDir\gradle-8.14.3-all.zip"
$tempFile = "$env:TEMP\gradle-8.14.3-all.zip"
$url = "https://services.gradle.org/distributions/gradle-8.14.3-all.zip"

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

Get-ChildItem -Path $targetDir -Filter "*.part" -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -Path $targetDir -Filter "*.lck" -ErrorAction SilentlyContinue | Remove-Item -Force

if (-not (Test-Path $targetFile)) {
    Write-Host "Downloading gradle-8.14.3-all.zip..."
    curl.exe -L $url -o $tempFile
    Move-Item -Path $tempFile -Destination $targetFile -Force
}

$item = Get-Item $targetFile
Write-Host "Gradle distribution ready: $($item.FullName) ($([math]::Round($item.Length / 1MB, 2)) MB)"
