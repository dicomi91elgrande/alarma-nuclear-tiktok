$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$nodePath = (Get-Command node -ErrorAction Stop).Source
try {
  $response = Invoke-WebRequest 'http://127.0.0.1:3191/overlay' -UseBasicParsing -TimeoutSec 2
  if ($response.Content -notmatch 'Parpadeo rojo') { throw 'El puerto 3191 está ocupado por otro programa.' }
} catch {
  if ($_.Exception.Message -like '*ocupado*') { throw }
  Start-Process -FilePath $nodePath -ArgumentList '"red-flash-server.mjs"' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput 'parpadeo.log' -RedirectStandardError 'parpadeo-error.log'
  $ready = $false
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250
    try { $response = Invoke-WebRequest 'http://127.0.0.1:3191/overlay' -UseBasicParsing -TimeoutSec 1; if ($response.Content -match 'Parpadeo rojo') { $ready = $true; break } } catch {}
  }
  if (-not $ready) { throw 'No se pudo iniciar. Revisa parpadeo-error.log.' }
}
Start-Process 'http://127.0.0.1:3191'
