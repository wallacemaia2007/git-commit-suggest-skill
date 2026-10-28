# git-commit-suggest installer for Windows (PowerShell)
param(
  [string]$ProjectPath = ".",
  [string]$TargetDir = ".agents/skills/git-commit-suggest"
)

$ErrorActionPreference = "Stop"

Write-Host "Installing git-commit-suggest..." -ForegroundColor Cyan

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path (Join-Path $scriptRoot "..") "skills\git-commit-suggest"
$dest = Join-Path $ProjectPath $TargetDir

if (-not (Test-Path $dest)) {
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
}

Write-Host "Copying files..." -ForegroundColor Gray
Copy-Item -Path "$source\SKILL.md" -Destination $dest -Force
Copy-Item -Path "$source\config.example.json" -Destination $dest -Force
if (-not (Test-Path "$dest\config.json")) { Copy-Item -Path "$source\config.example.json" -Destination "$dest\config.json" }
if (Test-Path "$source\references") { Copy-Item -Path "$source\references" -Destination $dest -Recurse -Force }
if (Test-Path "$source\docs") { Copy-Item -Path "$source\docs" -Destination $dest -Recurse -Force }
if (Test-Path "$source\scripts") { Copy-Item -Path "$source\scripts" -Destination $dest -Recurse -Force }

Write-Host "Done! Installed to: $dest" -ForegroundColor Green
Write-Host "Edit config.json to change the language." -ForegroundColor Gray
Write-Host "Usage: @git-commit-suggest or 'sugira um commit para essas alterações'" -ForegroundColor Gray
