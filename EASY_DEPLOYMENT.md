# Easy Deployment Guide - Vercel (Free)

The easiest and cheapest way to deploy this app is using **Vercel's free tier**. It takes about 5 minutes.

## Step 1: Push to GitHub (1 minute)

If you haven't already:

```bash
cd /Users/cairocongerton/Desktop/Claude\ Code/new-stadium-checkin
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on [github.com](https://github.com/new) then:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/new-stadium-checkin.git
git push -u origin main
```

## Step 2: Deploy to Vercel (3 minutes)

1. Go to [vercel.com](https://vercel.com) and sign up (can use GitHub account)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your `new-stadium-checkin` repository
5. Click **"Import"**

## Step 3: Add Environment Variables (1 minute)

Before clicking Deploy, add these 3 environment variables:

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://yqvguaesjrrxoefgnast.supabase.co
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: sb_publishable_s1YKW1nVFOWgczn8Q3mSFA_Tf_oyK3R
```

**Variable 3:**
```
Name: ADMIN_PASSWORD
Value: admin123
```

⚠️ **IMPORTANT**: Change `admin123` to a secure password!

## Step 4: Deploy

Click **"Deploy"** and wait ~2 minutes for the build to complete.

## Done!

You'll get a URL like: `https://your-project-name.vercel.app`

- Main check-in form: `https://your-project-name.vercel.app`
- Admin dashboard: `https://your-project-name.vercel.app/admin`

## Cost

**$0/month** - Vercel's free tier includes:
- Unlimited deployments
- Automatic HTTPS
- 100GB bandwidth/month
- Perfect for this application

## Auto-Updates

Every time you push to GitHub, Vercel automatically redeploys. No manual steps needed!

```bash
# Make changes, then:
git add .
git commit -m "Your changes"
git push
# Vercel automatically deploys!
```

## Optional: Custom Domain

If you want a custom domain (like `checkin.newstadium.com`):

1. Buy a domain from any provider (Namecheap, Google Domains, etc.)
2. In Vercel project settings → Domains
3. Add your domain
4. Update DNS records as instructed
5. Done! Free SSL included.

## Need Help?

- Vercel deployment issues: Check build logs in Vercel dashboard
- Database not working: Verify environment variables are set correctly
- Admin password not working: Make sure to redeploy after changing env vars

That's it! Your app is now live and ready to use.
