# New Stadium Guest Check-In Application

A production-ready web application for managing guest check-ins at New Stadium. Features real-time email lookup, returning visitor detection, and a comprehensive admin dashboard with analytics and export capabilities.

## Features

### Guest Check-In
- **Two-State Form Logic**: Automatically detects first-time vs. returning visitors
- **Real-time Email Lookup**: 500ms debounced search with rate limiting (10 lookups/minute)
- **Smart Pre-filling**: Returning visitors see pre-filled name and disciplines
- **Quick Fill**: "Same as last time" button for repeat visit reasons
- **Duplicate Prevention**: Blocks check-ins within 1 minute of last submission
- **Full Validation**: Comprehensive client-side validation with clear error messages

### Admin Dashboard (`/admin`)
- **Password Protection**: Simple password-based authentication
- **Real-time Analytics**:
  - Check-ins today, this week, and this month
  - Discipline breakdown with visual bar charts
  - Recent activity feed (last 20 check-ins)
- **User Management**:
  - Sortable table by name, email, visits, or last visit
  - Search/filter functionality
  - Expandable rows to view complete visit history
- **Data Export**:
  - Export to CSV with date range filtering
  - Filtered export based on search results

### Design & UX
- **Apfel Grotezk Typography**: Custom font loading with proper fallbacks
- **Minimalist Design**: Black and white color scheme inspired by newsystems.ca
- **Fully Responsive**: Works seamlessly on mobile, tablet, and desktop
- **Accessible**: ARIA labels, keyboard navigation, focus management
- **Loading States**: Spinners and visual feedback for all async operations
- **Smooth Animations**: Fade-in transitions and success messages

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Custom CSS with Apfel Grotezk font
- **Database**: Supabase (PostgreSQL)
- **Validation**: Custom validation utilities with regex patterns
- **Type Safety**: Full TypeScript coverage, no `any` types

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Supabase Account**: Free tier is sufficient ([supabase.com](https://supabase.com))
- **Git**: For version control (optional but recommended)

## Local Development Setup

### 1. Clone the Repository

```bash
cd new-stadium-checkin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: new-stadium-checkin (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Wait for the project to finish setting up (~2 minutes)

#### Get Your Supabase Credentials

1. In your Supabase project dashboard, click "Settings" (gear icon)
2. Navigate to "API" in the sidebar
3. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

#### Set Up the Database Schema

1. In your Supabase project, click "SQL Editor" in the sidebar
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste into the SQL editor
5. Click "Run" to execute the schema
6. Verify the tables were created by checking "Table Editor" in the sidebar

You should see two tables:
- `users` - Stores user information
- `visits` - Records each check-in

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ADMIN_PASSWORD=your-secure-admin-password
```

⚠️ **Important**:
- Replace `your-project-id`, `your-anon-key-here`, and `your-secure-admin-password` with actual values
- Never commit `.env.local` to version control
- Use a strong password for `ADMIN_PASSWORD` in production

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Access the Admin Dashboard

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) and enter your admin password.

## Project Structure

```
new-stadium-checkin/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard page
│   ├── globals.css            # Global styles and font declarations
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main check-in page
├── components/
│   └── CheckInForm.tsx        # Main check-in form component
├── lib/
│   ├── supabase/
│   │   └── client.ts          # Supabase client initialization
│   ├── database.ts            # Database operations and queries
│   └── validation.ts          # Form validation utilities
├── types/
│   └── index.ts               # TypeScript type definitions
├── supabase/
│   └── schema.sql             # Database schema and migrations
├── public/
│   └── fonts/                 # Apfel Grotezk font files
├── .env.local                 # Environment variables (create this)
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore rules
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project dependencies
└── README.md                  # This file
```

## Database Schema

### Users Table

| Column        | Type      | Description                          |
|--------------|-----------|--------------------------------------|
| id           | UUID      | Primary key                          |
| email        | TEXT      | Unique email address                 |
| name         | TEXT      | User's full name                     |
| disciplines  | TEXT[]    | Array of disciplines (Software, Hardware, Creative) |
| created_at   | TIMESTAMPTZ | Account creation timestamp         |
| updated_at   | TIMESTAMPTZ | Last update timestamp              |

### Visits Table

| Column                | Type      | Description                          |
|----------------------|-----------|--------------------------------------|
| id                   | UUID      | Primary key                          |
| user_id              | UUID      | Foreign key to users table           |
| timestamp            | TIMESTAMPTZ | Check-in timestamp                  |
| reason_for_visit     | TEXT      | Reason for the visit                 |
| disciplines_at_visit | TEXT[]    | Disciplines at time of visit         |

## Validation Rules

### Email
- Must be a valid email format (regex validated)
- Required field

### Name
- 2-50 characters
- Letters, spaces, hyphens, and apostrophes only
- Required field

### Disciplines
- At least one must be selected
- Valid options: Software, Hardware, Creative

### Reason for Visit
- 10-500 characters
- Required field

### Security
- All inputs are sanitized to prevent XSS attacks
- SQL injection protection via Supabase parameterized queries
- Rate limiting on email lookups (10 per minute)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/new-stadium-checkin.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 3. Add Environment Variables

In the Vercel project settings, add the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `ADMIN_PASSWORD` - Your admin dashboard password

### 4. Deploy

Click "Deploy" and wait for the build to complete (~2 minutes).

Your application will be available at `https://your-project.vercel.app`

## Environment Variables Guide

### `NEXT_PUBLIC_SUPABASE_URL`
- **Required**: Yes
- **Description**: Your Supabase project URL
- **Example**: `https://abcdefghijk.supabase.co`
- **Where to find**: Supabase Dashboard → Settings → API → Project URL

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Required**: Yes
- **Description**: Your Supabase anonymous/public API key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard → Settings → API → anon public key
- **Note**: This is safe to expose in client-side code

### `ADMIN_PASSWORD`
- **Required**: Yes
- **Description**: Password for accessing the admin dashboard
- **Example**: `mySecureAdminPass123!`
- **Security**: Use a strong, unique password
- **Note**: In production, consider implementing proper authentication

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**: Ensure `.env.local` exists and contains valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` values.

### Issue: Database connection errors

**Solution**:
1. Verify your Supabase project is active
2. Check that the database schema has been applied (run `supabase/schema.sql`)
3. Confirm environment variables are correct
4. Check Supabase dashboard for any service issues

### Issue: "Failed to lookup user" or database errors

**Solution**:
1. Verify RLS policies are correctly set up (they're in `schema.sql`)
2. Check Supabase logs in Dashboard → Logs
3. Ensure tables exist with correct column names
4. Try running the schema.sql file again

### Issue: Email lookup not working

**Solution**:
1. Check browser console for errors
2. Verify rate limiting hasn't been hit (max 10 lookups/minute)
3. Ensure Supabase connection is working
4. Check that users table has data to look up

### Issue: Admin dashboard shows "Invalid password"

**Solution**:
1. Verify `ADMIN_PASSWORD` in `.env.local` matches what you're entering
2. Restart the development server after changing `.env.local`
3. Check for typos or extra spaces in the password

### Issue: Fonts not loading

**Solution**:
1. Verify font files exist in `public/fonts/`
2. Check browser console for 404 errors
3. Clear browser cache and hard reload (Cmd/Ctrl + Shift + R)

### Issue: TypeScript errors

**Solution**:
```bash
npm run build
```
Check the console output for specific type errors and resolve them.

### Issue: Build fails on Vercel

**Solution**:
1. Ensure all environment variables are set in Vercel project settings
2. Check build logs for specific errors
3. Try building locally first: `npm run build`
4. Verify all dependencies are in `package.json`

## Performance Optimizations

- **Email Lookup Debouncing**: 500ms delay prevents excessive database queries
- **Rate Limiting**: Maximum 10 email lookups per minute per client
- **Indexed Database Queries**: All frequently queried columns have indexes
- **Optimized Font Loading**: `font-display: swap` prevents FOIT
- **Lazy Loading**: Admin dashboard loads analytics data only when authenticated
- **Efficient Rendering**: React best practices, memoization where needed

## Security Considerations

### Input Validation
- All user inputs are validated both client-side and via database constraints
- Email format validation using regex
- Character limits enforced on all text fields
- Discipline selection limited to predefined options

### Input Sanitization
- All inputs sanitized to remove potential XSS vectors
- Removal of HTML tags, JavaScript protocols, and event handlers
- Database queries use parameterized statements (Supabase handles this)

### Row Level Security (RLS)
- Enabled on all tables
- Anonymous users can read and insert data (required for public check-in)
- Consider restricting to authenticated users only for production

### Admin Authentication
- Currently using simple password check
- **Production Recommendation**: Implement proper authentication (e.g., NextAuth.js)
- Admin password should be a strong, unique password
- Consider adding 2FA for admin access

### Rate Limiting
- Email lookups limited to 10 per minute per client
- Prevents abuse and excessive database load
- Consider adding server-side rate limiting for production

## Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile Safari**: iOS 12+
- **Chrome Mobile**: Android 8+

## Accessibility

- Semantic HTML structure
- ARIA labels on form inputs
- Keyboard navigation support (Tab, Enter)
- Focus management and visible focus indicators
- Screen reader friendly error messages
- Color contrast meets WCAG AA standards

## Testing Checklist

- [ ] Email lookup works with 500ms debounce
- [ ] Returning users see pre-filled name (read-only)
- [ ] Returning users see pre-filled disciplines (editable)
- [ ] "Same as last time" button fills reason field
- [ ] Duplicate check-in prevention works (1 minute window)
- [ ] All validation errors display correctly
- [ ] Form submission shows success message
- [ ] Form resets after 2 seconds
- [ ] Admin dashboard loads with correct password
- [ ] Admin dashboard shows accurate analytics
- [ ] Table sorting works for all columns
- [ ] Search/filter works in admin
- [ ] User row expansion shows visit history
- [ ] CSV export downloads successfully
- [ ] Mobile responsive on various screen sizes
- [ ] Keyboard navigation works throughout
- [ ] Loading states appear for all async operations
- [ ] Error handling works for network failures

## Future Enhancements

- [ ] Email notifications for check-ins
- [ ] QR code generation for quick check-in
- [ ] Multi-language support
- [ ] Advanced analytics (charts, trends)
- [ ] User profiles with photos
- [ ] Visitor badge printing
- [ ] Integration with calendar systems
- [ ] Two-factor authentication for admin
- [ ] API endpoints for third-party integrations
- [ ] Automated check-out system

## License

This project is proprietary and confidential.

## Support

For issues, questions, or feature requests, please contact the development team.

---

**Built with** ❤️ **using Next.js, TypeScript, Supabase, and Tailwind CSS**
