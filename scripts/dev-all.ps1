$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"

$frontendListeners = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
foreach ($listener in $frontendListeners) {
    if ($listener.OwningProcess -and $listener.OwningProcess -ne $PID) {
        Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

$existing = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
$backendJob = $null

if (-not $existing) {
    $backendJob = Start-Job -ScriptBlock {
        param($backendPath)
        Set-Location $backendPath
        php artisan serve --host=127.0.0.1 --port=8000
    } -ArgumentList $backend
    Start-Sleep -Seconds 2
}

try {
    npm run dev
} finally {
    if ($backendJob) {
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
    }
}
