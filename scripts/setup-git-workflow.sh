#!/bin/bash

# RepFlow - Git Workflow Setup Script
# Sets up proper Git branches and workflow

set -e  # Exit on any error

echo "🌿 Setting up RepFlow Git Workflow..."
echo "====================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository"
    echo "Initialize with: git init"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Create develop branch if it doesn't exist
if ! git show-ref --verify --quiet refs/heads/develop; then
    echo "🌱 Creating 'develop' branch..."
    git checkout -b develop
    git push -u origin develop
else
    echo "✅ 'develop' branch already exists"
fi

# Create main branch if it doesn't exist
if ! git show-ref --verify --quiet refs/heads/main; then
    echo "🌱 Creating 'main' branch..."
    if [ "$CURRENT_BRANCH" != "main" ]; then
        git checkout -b main
        git push -u origin main
    fi
else
    echo "✅ 'main' branch already exists"
fi

# Set up branch protection (informational)
echo ""
echo "📋 Git Workflow Setup Complete!"
echo "================================"
echo ""
echo "🌿 Branch Structure:"
echo "  • main     - Production branch (protected)"
echo "  • develop  - Development branch (staging deployments)"
echo "  • feature/* - Feature branches (merge to develop)"
echo ""
echo "🔄 Workflow:"
echo "  1. Create feature branches from 'develop'"
echo "  2. Merge feature branches to 'develop' via PR"
echo "  3. Deploy 'develop' to staging for testing"
echo "  4. Merge 'develop' to 'main' for production"
echo ""
echo "📝 Recommended branch protection rules (set up in GitHub):"
echo "  • Require PR reviews before merging to main"
echo "  • Require status checks to pass"
echo "  • Require branches to be up to date"
echo "  • Restrict pushes to main branch"
echo ""

# Switch to develop branch for continued development
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "🔄 Switching to 'develop' branch for continued development..."
    git checkout develop
fi

echo "✅ Git workflow setup complete!" 