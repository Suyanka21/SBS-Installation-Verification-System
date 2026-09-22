<#
.SYNOPSIS
    Spawns a new project initialized with all Agent Skills.

.DESCRIPTION
    Copies the agent skills starter template to a new target directory,
    re-initializes a fresh git repository, and prepares it for development.

.PARAMETER TargetPath
    The directory path where the new project should be created.

.EXAMPLE
    .\setup-new-project.ps1 -TargetPath "..\my-awesome-app"
#>

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$TargetPath
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Agent Skills Project Bootstrapper         " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

if (Test-Path $TargetPath) {
    $existing = Get-ChildItem -Path $TargetPath
    if ($existing.Count -gt 0) {
        Write-Warning "Target directory '$TargetPath' already exists and is not empty."
        $confirm = Read-Host "Proceed anyway? (y/n)"
        if ($confirm -ne 'y') {
            Write-Host "Aborted." -ForegroundColor Yellow
            exit
        }
    }
} else {
    New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
}

$ResolvedTarget = (Resolve-Path $TargetPath).Path

Write-Host "Copying template files to: $ResolvedTarget ..." -ForegroundColor Green

# Items to copy
$itemsToCopy = @(".agents", ".cursor", "docs", "src", "package.json", "tsconfig.json", "tailwind.config.ts", "postcss.config.js", "AGENTS.md", "GEMINI.md", "CLAUDE.md", ".cursorrules", ".gitignore", "README.md")

foreach ($item in $itemsToCopy) {
    $srcItem = Join-Path $ScriptDir $item
    if (Test-Path $srcItem) {
        Copy-Item -Recurse -Path $srcItem -Destination $ResolvedTarget -Force
        Write-Host "  [+] Copied $item" -ForegroundColor Gray
    }
}

Write-Host "`nInitializing fresh git repository in target..." -ForegroundColor Green
Push-Location $ResolvedTarget
try {
    if (-not (Test-Path ".git")) {
        git init -b main | Out-Null
        git add . | Out-Null
        git commit -m "chore: initial commit from agent-skills-starter-template" | Out-Null
        Write-Host "  [+] Initialized git repo on branch 'main'" -ForegroundColor Gray
    }
} catch {
    Write-Warning "Could not initialize git: $_"
} finally {
    Pop-Location
}

Write-Host "`nProject successfully initialized at: $ResolvedTarget" -ForegroundColor Green
Write-Host "Open this folder in your favorite AI editor (Kilo Code, Cursor, Claude Code, VS Code, Antigravity)." -ForegroundColor Cyan
Write-Host "The AI agent will automatically detect and follow all 27 skills and rules.`n" -ForegroundColor Cyan
