# RepFlow - Staging Deployment Script (PowerShell)
# Deploys to rep-flow-staging Firebase project

Write-Host "🚀 Starting RepFlow Staging Deployment..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
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

Write-Host "🔥 Switching to staging Firebase project..." -ForegroundColor Blue
firebase use rep-flow-staging
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "📋 Deploying Firestore rules and indexes..." -ForegroundColor Blue
firebase deploy --only firestore:rules,firestore:indexes --project rep-flow-staging
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "🌐 Deploying to Firebase Hosting (staging)..." -ForegroundColor Blue
firebase deploy --only hosting --project rep-flow-staging
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "✅ Staging deployment completed successfully!" -ForegroundColor Green
Write-Host "🌍 Your app is live at: https://rep-flow-staging.web.app" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green 