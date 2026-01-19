# Common Commands Reference

Quick reference for all common development and deployment commands.

## Development

### Start Development Server
```bash
npm run dev
```
Opens at: http://localhost:3000

### Build for Production
```bash
npm run build
```
Checks TypeScript, builds optimized production bundle

### Start Production Server (locally)
```bash
npm run start
```
Runs the production build locally

### Run Linting
```bash
npm run lint
```
Checks code for ESLint issues

## Environment Setup

### Copy Environment Template
```bash
cp .env.example .env.local
```

### Edit Environment Variables
```bash
# macOS/Linux
nano .env.local

# Windows
notepad .env.local
```

## Git Commands

### Initialize Repository
```bash
git init
git add .
git commit -m "Initial commit"
```

### Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/new-stadium-checkin.git
git push -u origin main
```

### Create New Branch
```bash
git checkout -b feature/your-feature-name
```

### Commit Changes
```bash
git add .
git commit -m "Your commit message"
git push
```

## Database Commands

### Apply Database Schema (Supabase SQL Editor)
1. Copy contents of `supabase/schema.sql`
2. Paste into Supabase SQL Editor
3. Click "Run"

### Backup Database (from Supabase Dashboard)
1. Go to Database → Backups
2. Click "Create Backup"

## Vercel Deployment

### Deploy via Git (Recommended)
```bash
git push origin main
```
Automatically triggers Vercel deployment

### Deploy via Vercel CLI (Alternative)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs
```

## Maintenance Commands

### Check for Outdated Dependencies
```bash
npm outdated
```

### Update Dependencies
```bash
# Update all to latest versions
npm update

# Update specific package
npm install package-name@latest
```

### Clean Install (if issues)
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear Next.js Cache
```bash
rm -rf .next
npm run build
```

## Testing Commands

### Test Build Locally
```bash
npm run build
npm run start
```
Then visit http://localhost:3000

### Test Admin Dashboard
```bash
npm run dev
```
Then visit http://localhost:3000/admin

### Test Form Submission
1. Start dev server
2. Fill out form
3. Check browser console for log
4. Check Supabase Table Editor for new entry

## Database Queries (Supabase SQL Editor)

### View All Users
```sql
SELECT * FROM users ORDER BY updated_at DESC;
```

### View All Visits
```sql
SELECT v.*, u.name, u.email
FROM visits v
JOIN users u ON v.user_id = u.id
ORDER BY v.timestamp DESC;
```

### Count Total Check-ins
```sql
SELECT COUNT(*) as total_visits FROM visits;
```

### Check-ins Today
```sql
SELECT COUNT(*) as today_visits
FROM visits
WHERE timestamp >= CURRENT_DATE;
```

### Most Active Users
```sql
SELECT u.name, u.email, COUNT(v.id) as visit_count
FROM users u
LEFT JOIN visits v ON u.id = v.user_id
GROUP BY u.id, u.name, u.email
ORDER BY visit_count DESC
LIMIT 10;
```

### Delete Test Data
```sql
-- WARNING: This deletes all data!
DELETE FROM visits;
DELETE FROM users;
```

## Troubleshooting Commands

### Check Node Version
```bash
node --version
# Should be 18.x or higher
```

### Check npm Version
```bash
npm --version
# Should be 9.x or higher
```

### Check Environment Variables
```bash
# macOS/Linux
cat .env.local

# Windows
type .env.local
```

### Test Supabase Connection
Create a test file `test-connection.js`:
```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  const { data, error } = await supabase.from('users').select('count');
  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('Connection successful!', data);
  }
}

testConnection();
```

Run with:
```bash
npm install dotenv
node test-connection.js
```

### View Build Output Size
```bash
npm run build
# Look for the Route table showing page sizes
```

### Check Port Usage
```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

### Kill Process on Port 3000
```bash
# macOS/Linux
kill -9 $(lsof -t -i:3000)

# Windows
# Find PID from netstat command above, then:
taskkill /PID <PID> /F
```

## Code Formatting

### Format All Files (if Prettier installed)
```bash
npx prettier --write .
```

### Format Specific File
```bash
npx prettier --write path/to/file.tsx
```

## Package Management

### Install New Package
```bash
npm install package-name

# Dev dependency
npm install -D package-name
```

### Uninstall Package
```bash
npm uninstall package-name
```

### List Installed Packages
```bash
npm list --depth=0
```

## Quick Shortcuts

### Full Clean + Rebuild
```bash
rm -rf node_modules .next package-lock.json && npm install && npm run build
```

### Quick Test Cycle
```bash
npm run build && npm run start
```

### Create Production Bundle Info
```bash
ANALYZE=true npm run build
```

## Useful File Locations

### Logs
- Browser Console: F12 (Developer Tools)
- Vercel Logs: vercel.com → Your Project → Deployments → [deployment] → Logs
- Supabase Logs: Supabase Dashboard → Logs

### Configuration Files
- Environment: `.env.local`
- TypeScript: `tsconfig.json`
- Tailwind: `tailwind.config.ts`
- ESLint: `eslint.config.mjs`
- Prettier: `.prettierrc`
- Vercel: `vercel.json`

### Application Files
- Main Form: `components/CheckInForm.tsx`
- Admin Dashboard: `app/admin/page.tsx`
- Database Logic: `lib/database.ts`
- Validation: `lib/validation.ts`
- Types: `types/index.ts`

## Documentation Files

- Quick Start: `QUICKSTART.md`
- Full Guide: `README.md`
- Features: `FEATURES.md`
- Deployment: `DEPLOYMENT_CHECKLIST.md`
- Summary: `PROJECT_SUMMARY.md`
- This File: `COMMANDS.md`

## Need Help?

- Check README.md Troubleshooting section
- Review FEATURES.md for implementation details
- See QUICKSTART.md for basic setup
- Check Vercel/Supabase documentation
