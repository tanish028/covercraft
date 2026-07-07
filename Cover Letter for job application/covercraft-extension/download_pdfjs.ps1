# Run this once to download PDF.js into the extension folder.
# In PowerShell: right-click this file -> "Run with PowerShell"
# Or: cd to this folder, then: .\download_pdfjs.ps1

$folder  = Split-Path -Parent $MyInvocation.MyCommand.Path
$version = "3.4.120"
$base    = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/$version"

Write-Host "Downloading PDF.js $version..." -ForegroundColor Cyan

try {
    Invoke-WebRequest "$base/pdf.min.js"        -OutFile "$folder\pdf.min.js"        -UseBasicParsing
    Invoke-WebRequest "$base/pdf.worker.min.js" -OutFile "$folder\pdf.worker.min.js" -UseBasicParsing
    Write-Host "Done! Both files saved to: $folder" -ForegroundColor Green
    Write-Host "Now reload the extension in about:debugging." -ForegroundColor Yellow
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
}

Read-Host "Press Enter to close"
