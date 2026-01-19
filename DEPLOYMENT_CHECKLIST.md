# Deployment Checklist

Follow this checklist to deploy your New Stadium Check-in application to production.

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Supabase project created
- [ ] Database schema applied (`supabase/schema.sql`)
- [ ] Tables verified in Supabase Table Editor
- [ ] `.env.local` configured with valid credentials
- [ ] Application tested locally (`npm run dev`)
- [ ] Build tested successfully (`npm run build`)

### 2. Security Review
- [ ] Changed `ADMIN_PASSWORD` from default
- [ ] Verified Supabase RLS policies are enabled
- [ ] Checked that `.env.local` is in `.gitignore`
- [ ] Reviewed input sanitization is working
- [ ] Tested rate limiting on email lookups
- [ ] Confirmed duplicate check-in prevention works

### 3. Code Quality
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on mobile device
- [ ] Verified keyboard navigation works
- [ ] Checked all form validations

### 4. Data Verification
- [ ] Test user created successfully
- [ ] Visit recorded in database
- [ ] Returning user detection works
- [ ] Admin dashboard shows correct data
- [ ] CSV export downloads properly

## GitHub Setup

### 1. Initialize Git Repository
```bash
cd new-stadium-checkin
git init
git add .
git commit -m "Initial commit: New Stadium check-in application"
```

### 2. Create GitHub Repository
- [ ] Go to [github.com](https://github.com) and create new repository
- [ ] Name: `new-stadium-checkin` (or your preferred name)
- [ ] Visibility: Private (recommended) or Public
- [ ] Do NOT initialize with README (you already have one)

### 3. Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/new-stadium-checkin.git
git push -u origin main
```

### 4. Verify Push
- [ ] All files visible on GitHub
- [ ] `.env.local` NOT visible (should be ignored)
- [ ] README.md displays correctly

## Vercel Deployment

### 1. Create Vercel Account
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign up (can use GitHub account)

### 2. Import Project
- [ ] Click "Add New Project"
- [ ] Select "Import Git Repository"
- [ ] Choose your `new-stadium-checkin` repository
- [ ] Click "Import"

### 3. Configure Project
- [ ] **Framework Preset**: Next.js (should auto-detect)
- [ ] **Root Directory**: `./` (leave default)
- [ ] **Build Command**: `npm run build` (leave default)
- [ ] **Output Directory**: `.next` (leave default)
- [ ] **Install Command**: `npm install` (leave default)

### 4. Add Environment Variables
Click "Environment Variables" and add:

```
NEXT_PUBLIC_SUPABASE_URL
```
Value: Your Supabase project URL

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Value: Your Supabase anon public key

```
ADMIN_PASSWORD
```
Value: Your secure admin password (NOT "admin123")

- [ ] All three variables added
- [ ] Values are correct (copy from `.env.local`)
- [ ] No typos in variable names

### 5. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (~2 minutes)
- [ ] Check for build errors

### 6. Verify Deployment
- [ ] Visit your deployment URL (e.g., `your-project.vercel.app`)
- [ ] Test main check-in form
- [ ] Create a test check-in
- [ ] Verify it appears in Supabase
- [ ] Access `/admin` page
- [ ] Login with your admin password
- [ ] Verify analytics display
- [ ] Test CSV export

## Post-Deployment

### 1. Custom Domain (Optional)
- [ ] Purchase domain (if needed)
- [ ] Add domain in Vercel project settings
- [ ] Configure DNS records
- [ ] Wait for SSL certificate (automatic)
- [ ] Verify HTTPS works

### 2. Testing in Production
- [ ] Test from different devices
- [ ] Test from different browsers
- [ ] Verify mobile responsiveness
- [ ] Check loading times
- [ ] Test error handling (try invalid inputs)
- [ ] Verify duplicate prevention works

### 3. Monitoring Setup
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up Supabase monitoring
- [ ] Check Supabase logs regularly
- [ ] Monitor error rates

### 4. Backup & Recovery
- [ ] Export initial database backup
- [ ] Document recovery procedures
- [ ] Save environment variables securely
- [ ] Keep local copy of code

## Production Hardening

### 1. Security Enhancements
- [ ] Consider implementing proper authentication (NextAuth.js)
- [ ] Add server-side rate limiting
- [ ] Set up CORS policies if needed
- [ ] Review RLS policies for production use
- [ ] Consider adding two-factor auth for admin

### 2. Performance Monitoring
- [ ] Monitor page load times
- [ ] Check database query performance
- [ ] Review Vercel analytics
- [ ] Optimize if needed

### 3. User Training
- [ ] Create user guide for front desk staff
- [ ] Document admin dashboard features
- [ ] Train on CSV export process
- [ ] Establish support procedures

## Troubleshooting Production Issues

### Build Fails
1. Check Vercel build logs
2. Verify environment variables are set
3. Try building locally: `npm run build`
4. Check for TypeScript errors

### Database Connection Errors
1. Verify Supabase project is active
2. Check environment variables are correct
3. Review Supabase logs
4. Verify RLS policies

### Performance Issues
1. Check Vercel analytics
2. Review database indexes
3. Monitor Supabase query performance
4. Consider upgrading Supabase plan if needed

### Admin Password Not Working
1. Verify `ADMIN_PASSWORD` env var is set in Vercel
2. Check for typos
3. Redeploy after changing env vars

## Maintenance Schedule

### Daily
- [ ] Check for any errors in Vercel logs
- [ ] Verify app is accessible

### Weekly
- [ ] Review check-in data in admin dashboard
- [ ] Export backup of data
- [ ] Check Supabase storage usage

### Monthly
- [ ] Review security logs
- [ ] Update dependencies if needed
- [ ] Verify SSL certificate
- [ ] Check performance metrics

## Rollback Plan

If something goes wrong:

1. **Vercel**: Use "Redeploy" to previous working deployment
2. **Database**: Restore from backup
3. **Code**: Revert Git commit and redeploy

## Support Contacts

Document your support contacts:
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Supabase Support: [supabase.com/support](https://supabase.com/support)
- Developer Contact: [Your contact info]

## Completion

Once all items are checked:
- [ ] Application is live and tested
- [ ] Users can access at production URL
- [ ] Admin dashboard is functional
- [ ] Data is flowing to database correctly
- [ ] Monitoring is set up
- [ ] Team is trained
- [ ] Documentation is accessible

## Next Steps

After successful deployment:
1. Monitor usage patterns
2. Gather user feedback
3. Plan feature enhancements (see README.md "Future Enhancements")
4. Schedule regular maintenance

---

**Deployment Date**: ________________

**Deployed By**: ________________

**Production URL**: ________________

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________
