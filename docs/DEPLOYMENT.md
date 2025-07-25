# RepFlow Deployment Guide

This guide covers the deployment process for RepFlow to both staging and production environments.

## 🏗️ Environment Setup

### Firebase Projects
- **Staging**: `rep-flow-staging` → https://rep-flow-staging.web.app
- **Production**: `rep-flow-prod` → https://rep-flow-prod.web.app

### Git Workflow
- **main** - Production branch (protected)
- **develop** - Development branch (staging deployments)
- **feature/** - Feature branches (merge to develop)

## 🚀 Quick Deployment

### Deploy to Staging
```bash
pnpm run deploy:staging
```

### Deploy to Production
```bash
pnpm run deploy:prod
```

## 📋 Detailed Deployment Process

### 1. Initial Setup (One-time)

```bash
# Make deployment scripts executable
pnpm run setup:deploy

# Set up Git workflow
pnpm run setup:git

# Login to Firebase (if not already)
firebase login
```

### 2. Staging Deployment

**From any branch (typically `develop`):**

```bash
# Option 1: Use the automated script
pnpm run deploy:staging

# Option 2: Manual deployment
pnpm install
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
firebase use rep-flow-staging
firebase deploy --project rep-flow-staging
```

**What the staging script does:**
- ✅ Installs dependencies
- ✅ Runs linting and type checking
- ✅ Runs tests
- ✅ Builds the application
- ✅ Switches to staging Firebase project
- ✅ Deploys Firestore rules and indexes
- ✅ Deploys to Firebase Hosting

### 3. Production Deployment

**From `main` branch only:**

```bash
# Switch to main branch
git checkout main
git pull origin main

# Deploy to production
pnpm run deploy:prod
```

**Production deployment safety checks:**
- ✅ Must be on `main` branch
- ✅ Working directory must be clean
- ✅ Confirmation prompt required
- ✅ All tests must pass
- ✅ Creates git tag for rollback
- ✅ Comprehensive validation

## 🔄 Recommended Workflow

### For Feature Development

1. **Create feature branch from develop:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/authentication-system
   ```

2. **Develop and test locally:**
   ```bash
   pnpm dev  # Test locally
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: implement authentication system"
   git push origin feature/authentication-system
   ```

4. **Create Pull Request to `develop`**

5. **Deploy to staging for testing:**
   ```bash
   git checkout develop
   git pull origin develop
   pnpm run deploy:staging
   ```

6. **Test on staging environment**

7. **Merge to main for production:**
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   pnpm run deploy:prod
   ```

## 🛠️ Deployment Scripts

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run deploy:staging` | Deploy to staging environment |
| `pnpm run deploy:prod` | Deploy to production environment |
| `pnpm run deploy:staging:rules` | Deploy only Firestore rules to staging |
| `pnpm run deploy:prod:rules` | Deploy only Firestore rules to production |
| `pnpm run deploy:all:rules` | Deploy Firestore rules to both environments |
| `pnpm run setup:git` | Set up Git workflow branches |
| `pnpm run setup:deploy` | Make deployment scripts executable |

### Script Locations

- `scripts/deploy-staging.sh` - Staging deployment script
- `scripts/deploy-production.sh` - Production deployment script
- `scripts/setup-git-workflow.sh` - Git workflow setup

## 🔒 Environment Variables

### Required Variables

Create `.env.local` in `apps/web/` directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# API Keys
VITE_RAPIDAPI_KEY=your_rapidapi_key

# Environment
VITE_ENV=staging  # or 'prod' for production
```

### Environment-Specific Variables

**Staging Environment:**
- Use `rep-flow-staging` Firebase project credentials
- Set `VITE_ENV=staging`

**Production Environment:**
- Use `rep-flow-prod` Firebase project credentials
- Set `VITE_ENV=prod`

## 🔍 Troubleshooting

### Common Issues

1. **Firebase CLI not installed:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Not logged in to Firebase:**
   ```bash
   firebase login
   ```

3. **Wrong Firebase project:**
   ```bash
   firebase use rep-flow-staging  # or rep-flow-prod
   ```

4. **Permission denied on scripts:**
   ```bash
   pnpm run setup:deploy
   ```

5. **Environment variables missing:**
   - Check `.env.local` file exists in `apps/web/`
   - Verify all required variables are set

### Deployment Logs

Check deployment status:
```bash
firebase hosting:channel:list --project rep-flow-staging
firebase hosting:channel:list --project rep-flow-prod
```

## 📊 Monitoring

### Post-Deployment Checks

After each deployment, verify:

1. **Application loads correctly**
2. **Authentication works**
3. **Firebase services connected**
4. **No console errors**
5. **All features functional**

### Rollback Process

If issues occur in production:

1. **Find the last working tag:**
   ```bash
   git tag -l "prod-*" | tail -5
   ```

2. **Rollback to previous version:**
   ```bash
   git checkout prod-YYYYMMDD-HHMMSS
   pnpm run deploy:prod
   ```

## 🎯 Best Practices

1. **Always test on staging first**
2. **Deploy during low-traffic hours**
3. **Monitor application after deployment**
4. **Keep deployment logs**
5. **Use semantic commit messages**
6. **Tag production releases**
7. **Review changes before production deployment**

---

**Need help?** Check the [Technical Design Document](./Technical_Design_Document.md) for more details about the deployment architecture. 