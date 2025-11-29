# Script để restart MongoDB không cần authentication
# Phải chạy PowerShell as Administrator

Write-Host "=== FIX MONGODB AUTHENTICATION ===" -ForegroundColor Cyan
Write-Host ""

# Tìm MongoDB config file
$possiblePaths = @(
    "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg",
    "C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg",
    "C:\Program Files\MongoDB\Server\5.0\bin\mongod.cfg"
)

$configPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $configPath = $path
        Write-Host "✓ Tìm thấy config: $path" -ForegroundColor Green
        break
    }
}

if (-not $configPath) {
    Write-Host "❌ Không tìm thấy MongoDB config file" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vui lòng:" -ForegroundColor Yellow
    Write-Host "1. Tìm file mongod.cfg trong: C:\Program Files\MongoDB\" -ForegroundColor Yellow
    Write-Host "2. Mở file bằng Notepad (Run as Administrator)" -ForegroundColor Yellow
    Write-Host "3. Comment 2 dòng:" -ForegroundColor Yellow
    Write-Host "   # security:" -ForegroundColor Yellow
    Write-Host "   #   authorization: enabled" -ForegroundColor Yellow
    Write-Host "4. Lưu và restart MongoDB service" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Dừng MongoDB service..." -ForegroundColor Yellow
Stop-Service MongoDB -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Backup config file..." -ForegroundColor Yellow
Copy-Item $configPath "$configPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "Tắt authentication..." -ForegroundColor Yellow
$content = Get-Content $configPath
$newContent = $content -replace '^(security:)', '# $1' -replace '^(  authorization:)', '# $1'
$newContent | Set-Content $configPath

Write-Host "Khởi động lại MongoDB..." -ForegroundColor Yellow
Start-Service MongoDB
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ HOÀN THÀNH!" -ForegroundColor Green
Write-Host "MongoDB đã chạy không cần authentication" -ForegroundColor Green
Write-Host ""
Write-Host "Tiếp theo:" -ForegroundColor Cyan
Write-Host "1. Restart dev server: pnpm dev" -ForegroundColor White
Write-Host "2. Thử login lại tại: http://localhost:3000/login" -ForegroundColor White
