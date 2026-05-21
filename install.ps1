#!/usr/bin/env pwsh
# Usage: .\install.ps1 <target-dir> <app-name> [app-title]
# Example: .\install.ps1 C:\src\my-app myapp "My App Title"

param(
    [Parameter(Position = 0)] [string] $TargetDir,
    [Parameter(Position = 1)] [string] $AppName,
    [Parameter(Position = 2)] [string] $AppTitle
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrEmpty($TargetDir) -or [string]::IsNullOrEmpty($AppName)) {
    Write-Output "Usage: .\install.ps1 <target-dir> <app-name> [app-title]"
    Write-Output 'Example: .\install.ps1 C:\src\my-app myapp "My App Title"'
    exit 1
}

if ([string]::IsNullOrEmpty($AppTitle)) { $AppTitle = $AppName }

$ScriptDir = $PSScriptRoot

Write-Output "Creating app '$AppTitle' ($AppName) in $TargetDir..."

New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

$dirs  = @('shared', '.github', 'tests', 'sql')
$files = @('index.html', 'app.js', 'app.css', 'config.js', 'CLAUDE.md',
           'package.json', 'jest.config.js', 'playwright.config.js', '.gitignore')

foreach ($d in $dirs) {
    Copy-Item -Recurse -Force -Path (Join-Path $ScriptDir $d) -Destination $TargetDir
}
foreach ($f in $files) {
    Copy-Item -Force -Path (Join-Path $ScriptDir $f) -Destination $TargetDir
}

function Replace-Literal([string] $Path, [hashtable] $Map) {
    $text = [System.IO.File]::ReadAllText($Path)
    foreach ($k in $Map.Keys) {
        $text = $text.Replace($k, $Map[$k])
    }
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $text, $utf8NoBom)
}

# config.js: replace title and table name
Replace-Literal (Join-Path $TargetDir 'config.js') @{
    "APP_TITLE: 'Listlet'"       = "APP_TITLE: '$AppTitle'"
    "DB_TABLE: 'listlet_sample'" = "DB_TABLE: '$AppName'"
}

# CLAUDE.md: replace title, leading heading, and table name
$claudePath = Join-Path $TargetDir 'CLAUDE.md'
Replace-Literal $claudePath @{
    "APP_TITLE: 'Listlet'"       = "APP_TITLE: '$AppTitle'"
    "DB_TABLE: 'listlet_sample'" = "DB_TABLE: '$AppName'"
}
# Anchor the heading replacement to start-of-line via regex
$claudeText = [System.IO.File]::ReadAllText($claudePath)
$claudeText = [Regex]::Replace($claudeText, '(?m)^# Listlet(?=\r?$)', "# $AppTitle")
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($claudePath, $claudeText, $utf8NoBom)

# sql/setup.sql: replace all occurrences of the sample table name
Replace-Literal (Join-Path $TargetDir 'sql\setup.sql') @{
    'listlet_sample' = $AppName
}

Push-Location $TargetDir
try {
    git init
    git add -A
    git commit -m "Initial app from listlet-shared"
} finally {
    Pop-Location
}

Write-Output ""
Write-Output "Done! Next steps:"
Write-Output "  cd $TargetDir"
Write-Output "  npm install"
Write-Output "  copy config.js config.local.js   # Edit with your Supabase keys"
Write-Output "  python -m http.server 8000              # Mock mode works without Supabase"
Write-Output "  npm test                                # Run unit tests"
Write-Output "  npm run test:e2e                        # Run E2E tests"
Write-Output ""
Write-Output "To customize: replace app.js and app.css with your own logic."
