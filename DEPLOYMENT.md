# Deployment Instructions

## Google Sheets Setup

Your Google Sheets spreadsheet is already configured with ID: `1LLiX1I6kGOuLzzldWjujA9bBSah0zQSCuymIOQ7-_Nk`

The spreadsheet should have two sheets:

### Users Sheet
Columns: `ID | EMAIL | NAME | DISCIPLINES | CREATED_AT | UPDATED_AT | PIN_HASH`

### Visits Sheet
Columns: `ID | USER_ID | TIMESTAMP | REASON | DISCIPLINES`

## Vercel Deployment

The app will auto-deploy from GitHub. You need to add one environment variable in Vercel:

1. Go to: https://vercel.com/cairocongerton-netizens-projects/new-stadium-checkin/settings/environment-variables

2. Add this variable:
   - **Name**: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - **Value**: (The formatted JSON from `/tmp/credentials-oneline.txt`)

3. The value should be the entire JSON object on one line, like:
   ```
   {"type":"service_account","project_id":"stadium-check-in-484917",...}
   ```

4. Save and redeploy

## Environment Variables Already Set

These are already configured in Vercel:
- `GOOGLE_SPREADSHEET_ID`: 1LLiX1I6kGOuLzzldWjujA9bBSah0zQSCuymIOQ7-_Nk
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: stadium-check-in-service@stadium-check-in-484917.iam.gserviceaccount.com

## Authentication Flow

1. **Register** (`/register`): New users create account with email, name, PIN, and disciplines
2. **Login** (`/login`): Users sign in with email AND PIN
3. **Check-in** (`/checkin`): After login, users enter reason for visit

## Security

- PINs are hashed using SHA-256 with random salts
- Never stored in plaintext
- Session managed via sessionStorage (client-side)
- All data stored in Google Sheets

## Live URL

https://new-stadium-checkin.vercel.app
