param(
  [string]$Branch = "kaizen7-frontier-operator",
  [string]$Remote = "https://github.com/Lucianople7/kaizen7.git",
  [string]$Message = "Add K7 loop and model gateway",
  [switch]$Ssh
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & git @Args
  if ($LASTEXITCODE -ne 0) {
    throw "git $($Args -join ' ') failed with exit code $LASTEXITCODE"
  }
}

$source = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$work = Join-Path $env:TEMP "kaizen7-push-$stamp"

if ($Ssh) {
  $Remote = "git@github.com:Lucianople7/kaizen7.git"
}

Write-Host "KAIZEN7 push helper"
Write-Host "Source: $source"
Write-Host "Work:   $work"

Invoke-Git clone --branch $Branch $Remote $work

$files = @(
  ".env.example",
  "KAIZEN7_INDEX.md",
  "Obsidian/Flowmatik/Kaizen7/KAIZEN7 OPERATING MANUAL.md",
  "Obsidian/Flowmatik/Producto/KAIZEN7 30 Second Activation.md",
  "Obsidian/Flowmatik/Producto/KAIZEN7 Model Gateway.md",
  "README.md",
  "app.js",
  "docs/30_SECOND_ACTIVATION.md",
  "docs/MODEL_GATEWAY.md",
  "docs/CHANGELOG.md",
  "docs/OPERATIONS.md",
  "index.html",
  "kaizen.connectors.json",
  "lib/activation-demo.js",
  "lib/model-gateway.js",
  "lib/production-readiness.js",
  "package.json",
  "server.js",
  "tests/activation-demo.test.js",
  "tests/model-gateway.test.js",
  "tests/production-readiness.test.js"
)

foreach ($file in $files) {
  $from = Join-Path $source $file
  $to = Join-Path $work $file
  $parent = Split-Path $to -Parent
  if (!(Test-Path $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
  Copy-Item -LiteralPath $from -Destination $to -Force
}

Push-Location $work
try {
  Invoke-Git status --short
  Invoke-Git add .
  Invoke-Git commit -m $Message
  Invoke-Git push origin $Branch
  Write-Host "Pushed $Branch to $Remote"
}
finally {
  Pop-Location
}
