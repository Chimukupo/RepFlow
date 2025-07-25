# RepFlow - Production Deployment Script (PowerShell)
# Deploys to rep-flow-prod Firebase project

Write-Host "🚀 Starting RepFlow Production Deployment..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if we're on the main branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "❌ Error: Production deployments must be from the 'main' branch" -ForegroundColor Red
    Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow
    Write-Host "Switch to main branch: git checkout main" -ForegroundColor Yellow
    exit 1
}

# Check if working directory is clean
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "❌ Error: Working directory is not clean" -ForegroundColor Red
    Write-Host "Please commit or stash your changes before deploying to production" -ForegroundColor Yellow
    git status
    exit 1
}

# Check if Firebase CLI is installed
try {
    firebase --version | Out-Null
} catch {
    Write-Host "❌ Error: Firebase CLI is not installed" -ForegroundColor Red
    Write-Host "Install it with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in to Firebase
try {
    firebase projects:list | Out-Null
} catch {
    Write-Host "❌ Error: Not logged in to Firebase" -ForegroundColor Red
    Write-Host "Login with: firebase login" -ForegroundColor Yellow
    exit 1
}

# Confirmation prompt for production
Write-Host "⚠️  WARNING: You are about to deploy to PRODUCTION!" -ForegroundColor Yellow
Write-Host "This will affect the live application at rep-flow-prod.web.app" -ForegroundColor Yellow
$confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "❌ Production deployment cancelled" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
pnpm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "🔍 Running linting and type checking..." -ForegroundColor Blue
pnpm run lint
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

pnpm run typecheck
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "🧪 Running tests..." -ForegroundColor Blue
pnpm run test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "🏗️  Building application..." -ForegroundColor Blue
pnpm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "🔥 Switching to production Firebase project..." -ForegroundColor Blue
firebase use rep-flow-prod
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "📋 Deploying Firestore rules and indexes..." -ForegroundColor Blue
firebase deploy --only firestore:rules,firestore:indexes --project rep-flow-prod
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "🌐 Deploying to Firebase Hosting (production)..." -ForegroundColor Blue
firebase deploy --only hosting --project rep-flow-prod
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Create a git tag for this deployment
$version = Get-Date -Format "yyyyMMdd-HHmmss"
git tag -a "prod-$version" -m "Production deployment $version"
git push origin "prod-$version"

Write-Host "✅ Production deployment completed successfully!" -ForegroundColor Green
Write-Host "🌍 Your app is live at: https://rep-flow-prod.web.app" -ForegroundColor Cyan
Write-Host "🏷️  Tagged as: prod-$version" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Green 