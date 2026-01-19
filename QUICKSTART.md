# Quick Start Guide

Get your New Stadium Check-in app running in under 10 minutes.

## Step 1: Install Dependencies (1 minute)

```bash
cd new-stadium-checkin
npm install
```

## Step 2: Set Up Supabase (3 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Fill in:
   - Project name: `new-stadium-checkin`
   - Database password: (create a strong password)
   - Region: (choose closest to you)
4. Wait ~2 minutes for setup

## Step 3: Create Database Tables (2 minutes)

1. In Supabase, click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click "Run"
5. Verify: Click "Table Editor" - you should see `users` and `visits` tables

## Step 4: Configure Environment Variables (1 minute)

1. In Supabase, go to Settings → API
2. Copy your:
   - Project URL
   - anon public key

3. Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ADMIN_PASSWORD=admin123
```

## Step 5: Run the App (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 6: Test It Out

### Main Check-in Form
1. Enter an email (e.g., `test@example.com`)
2. Fill in name, select disciplines, add reason
3. Click "Check In"
4. See success message

### Try Returning Visitor
1. Enter the same email again
2. Notice pre-filled name and disciplines
3. Click "Same as last time" for the reason
4. Check in again

### Admin Dashboard
1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Enter password: `admin123`
3. View analytics and check-ins
4. Click on a user row to see their visit history
5. Try exporting data to CSV

## Next Steps

- Change the `ADMIN_PASSWORD` to something secure
- Customize the disciplines in `types/index.ts` and `components/CheckInForm.tsx`
- Deploy to Vercel (see README.md)

## Troubleshooting

**Build errors?**
- Make sure `.env.local` has valid Supabase credentials
- Run `npm run build` to see detailed errors

**Database errors?**
- Verify you ran the `schema.sql` file in Supabase
- Check Supabase dashboard → Logs for errors

**Can't see data?**
- Check browser console for errors
- Verify environment variables are set correctly

## Need Help?

See the full [README.md](README.md) for comprehensive documentation.
