param(
  [string]$SourceRoot,
  [string]$Message
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Text)
  Write-Host ""
  Write-Host "==> $Text" -ForegroundColor Cyan
}

function Resolve-NotesSourceRoot {
  param([string]$OverrideRoot)

  if ($OverrideRoot) {
    if (-not (Test-Path -LiteralPath $OverrideRoot -PathType Container)) {
      throw "Source directory does not exist: $OverrideRoot"
    }
    return (Resolve-Path -LiteralPath $OverrideRoot).Path
  }

  if ($env:NOTES_ROOT) {
    if (-not (Test-Path -LiteralPath $env:NOTES_ROOT -PathType Container)) {
      throw "NOTES_ROOT does not exist: $env:NOTES_ROOT"
    }
    return (Resolve-Path -LiteralPath $env:NOTES_ROOT).Path
  }

  $latestExport = Get-ChildItem -LiteralPath "H:\" -Directory |
    ForEach-Object {
      Get-ChildItem -LiteralPath $_.FullName -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like "qq*_*" }
    } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $latestExport) {
    throw "No exported Youdao notes directory was found under H:\."
  }

  return $latestExport.FullName
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$resolvedSourceRoot = Resolve-NotesSourceRoot -OverrideRoot $SourceRoot
$commitMessage = if ($Message) { $Message } else { "Update public notes $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }

Write-Step "Using notes source"
Write-Host $resolvedSourceRoot

Push-Location $repoRoot

try {
  $env:NOTES_ROOT = $resolvedSourceRoot
  $env:npm_config_cache = Join-Path $repoRoot ".npm-cache"
  $gitCmdPath = "C:\Program Files\Git\cmd"
  if (Test-Path -LiteralPath $gitCmdPath) {
    $env:PATH = "$gitCmdPath;$env:PATH"
  }

  Write-Step "Syncing public notes"
  npm run docs:sync
  if ($LASTEXITCODE -ne 0) {
    throw "Sync failed."
  }

  Write-Step "Running local build check"
  npx -y node@20 node_modules/vitepress/bin/vitepress.js build docs
  if ($LASTEXITCODE -ne 0) {
    throw "Build failed."
  }

  Write-Step "Checking changes"
  $statusBeforeAdd = git status --short
  if (-not $statusBeforeAdd) {
    Write-Host "No changes detected. Nothing to publish." -ForegroundColor Yellow
    return
  }

  Write-Step "Staging changes"
  git add -A
  if ($LASTEXITCODE -ne 0) {
    throw "git add failed."
  }

  git diff --cached --quiet
  if ($LASTEXITCODE -eq 0) {
    Write-Host "No staged changes. Nothing to commit." -ForegroundColor Yellow
    return
  }

  Write-Step "Creating commit"
  git commit -m $commitMessage
  if ($LASTEXITCODE -ne 0) {
    throw "git commit failed."
  }

  $currentBranch = (git branch --show-current).Trim()
  if (-not $currentBranch) {
    throw "Could not determine current branch."
  }

  Write-Step "Pushing to remote"
  git push origin $currentBranch
  if ($LASTEXITCODE -ne 0) {
    throw "git push failed."
  }

  Write-Step "Publish complete"
  Write-Host "GitHub Pages will update automatically after the remote build finishes."
}
finally {
  Pop-Location
}
