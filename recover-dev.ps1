$ErrorActionPreference = 'SilentlyContinue'
# 1. Doi build cua agent khac xong (timeout 10 phut) de tranh race .next
$t = 0
while ($t -lt 600) {
  $p1 = Get-Process -Id 4904 -ErrorAction SilentlyContinue
  $p2 = Get-Process -Id 11652 -ErrorAction SilentlyContinue
  if (-not $p1 -and -not $p2) { break }
  Start-Sleep -Seconds 5
  $t += 5
}
Write-Output ("wait-build done t=" + $t + "s")
# 2. Xoa .next lech
Remove-Item -Recurse -Force apps/shell/.next
Write-Output ("next removed: " + (-not (Test-Path apps/shell/.next)))
# 3. Chay dev server nen (detached)
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
$dev = Start-Process -FilePath "C:\Program Files\nodejs\pnpm.CMD" -ArgumentList "--filter @tft/shell dev" -WorkingDirectory "C:\Users\Administrator\Desktop\tft-dashboard" -PassThru
Write-Output ("dev pid=" + $dev.Id)
# 4. Poll /meta toi da 180s
$t = 0
while ($t -lt 180) {
  try {
    $r = Invoke-WebRequest -Uri http://localhost:3000/meta -TimeoutSec 5
    Write-Output ("META STATUS: " + $r.StatusCode)
    break
  } catch {
    Write-Output ("try t=" + $t + "s err: " + $_.Exception.Message)
    if ($_.Exception.Message -match '\(500\)') { break }
  }
  Start-Sleep -Seconds 5
  $t += 5
}
Write-Output '--- routes-manifest ---'
Test-Path apps/shell/.next/routes-manifest.json
