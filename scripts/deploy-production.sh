#!/bin/bash

# RepFlow - Production Deployment Script
# Deploys to rep-flow-prod Firebase project

set -e  # Exit on any error

echo "🚀 Starting RepFlow Production Deployment..."
echo "============================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: Production deployments must be from the 'main' branch"
    echo "Current branch: $CURRENT_BRANCH"
    echo "Switch to main branch: git checkout main"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Working directory is not clean"
    echo "Please commit or stash your changes before deploying to production"
    git status
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI is not installed"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged in to Firebase"
    echo "Login with: firebase login"
    exit 1
fi

# Confirmation prompt for production
echo "⚠️  WARNING: You are about to deploy to PRODUCTION!"
echo "This will affect the live application at rep-flow-prod.web.app"
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Production deployment cancelled"
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🔍 Running linting and type checking..."
pnpm run lint
pnpm run typecheck

echo "🧪 Running tests..."
pnpm run test

echo "🏗️  Building application..."
pnpm run build

echo "🔥 Switching to production Firebase project..."
firebase use rep-flow-prod

echo "📋 Deploying Firestore rules and indexes..."
firebase deploy --only firestore:rules,firestore:indexes --project rep-flow-prod

echo "🌐 Deploying to Firebase Hosting (production)..."
firebase deploy --only hosting --project rep-flow-prod

# Create a git tag for this deployment
VERSION=$(date +"%Y%m%d-%H%M%S")
git tag -a "prod-$VERSION" -m "Production deployment $VERSION"
git push origin "prod-$VERSION"

echo "✅ Production deployment completed successfully!"
echo "🌍 Your app is live at: https://rep-flow-prod.web.app"
echo "🏷️  Tagged as: prod-$VERSION"
echo "============================================" 