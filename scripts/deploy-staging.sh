#!/bin/bash

# RepFlow - Staging Deployment Script
# Deploys to rep-flow-staging Firebase project

set -e  # Exit on any error

echo "🚀 Starting RepFlow Staging Deployment..."
echo "========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
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

echo "📦 Installing dependencies..."
pnpm install

echo "🔍 Running linting and type checking..."
pnpm run lint
pnpm run typecheck

echo "🧪 Running tests..."
pnpm run test

echo "🏗️  Building application..."
pnpm run build

echo "🔥 Switching to staging Firebase project..."
firebase use rep-flow-staging

echo "📋 Deploying Firestore rules and indexes..."
firebase deploy --only firestore:rules,firestore:indexes --project rep-flow-staging

echo "🌐 Deploying to Firebase Hosting (staging)..."
firebase deploy --only hosting --project rep-flow-staging

echo "✅ Staging deployment completed successfully!"
echo "🌍 Your app is live at: https://rep-flow-staging.web.app"
echo "=========================================" 