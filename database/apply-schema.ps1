$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env.local'
$exampleEnvFile = Join-Path $root '.env.example'

if (-not (Test-Path $envFile) -and (Test-Path $exampleEnvFile)) {
  Copy-Item -LiteralPath $exampleEnvFile -Destination $envFile
}

$databaseUrl = $env:DATABASE_URL
if (-not $databaseUrl -and (Test-Path $envFile)) {
  $line = Get-Content -LiteralPath $envFile | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
  if ($line) {
    $databaseUrl = $line -replace '^DATABASE_URL=', ''
  }
}

if (-not $databaseUrl) {
  throw 'DATABASE_URL is missing. Set it in .env.local before applying the schema.'
}

$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
if (-not (Test-Path $psql)) {
  $psql = 'psql'
}

& $psql $databaseUrl -f (Join-Path $PSScriptRoot 'admin-schema.sql')
