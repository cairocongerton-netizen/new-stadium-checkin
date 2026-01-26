# Testing Guide

## ✅ Issues Fixed

### 1. Google Sheets Data Cleared
- All user and visit data has been cleared
- Fresh start ready for testing
- Run `node clear-sheets.js` anytime to clear data again

### 2. UI Centering Fixed
- All pages now centered vertically and horizontally
- Login, Register, and Check-in forms are now properly centered
- Better mobile and desktop experience

### 3. Login Error Messages Improved
**Before:** "Invalid email or PIN" (unclear what the problem was)

**Now:**
- "Account not found. Please register first." - When email doesn't exist
- "Incorrect PIN. Please try again." - When PIN is wrong
- "Account exists but has no PIN. Please contact support." - Edge case

## 🧪 How to Test

### Test 1: Register New Account
1. Go to https://new-stadium-checkin.vercel.app
2. Click "Register New Account"
3. Fill in:
   - Email: `cairocongerton@gmail.com`
   - Name: `Cairo Congerton`
   - Disciplines: Choose any
   - PIN: `6008`
   - Confirm PIN: `6008`
4. Click "Create Account"
5. Should redirect to login page with success message

### Test 2: Login with Correct Credentials
1. On login page, enter:
   - Email: `cairocongerton@gmail.com`
   - PIN: `6008`
2. Click "Sign In"
3. Should redirect to check-in page

### Test 3: Check In
1. After logging in, enter a reason for visit (at least 10 characters)
2. Click "Check In"
3. Should show success animation
4. Check Google Sheets - new visit should be recorded

### Test 4: Login with Wrong PIN
1. Go to login page
2. Enter:
   - Email: `cairocongerton@gmail.com`
   - PIN: `1234` (wrong)
3. Should show: "Incorrect PIN. Please try again."

### Test 5: Login with Non-Existent Email
1. Go to login page
2. Enter:
   - Email: `nonexistent@example.com`
   - PIN: `1234`
3. Should show: "Account not found. Please register first."

## 🔍 Debug Logs

The authentication now logs to console (visible in Vercel logs):
- 🔍 Email being authenticated
- 📊 Total users in sheet
- ❌ Errors with specific reasons
- ✅ Successful authentications

## 📊 Google Sheets Structure

### Users Sheet
| ID | EMAIL | NAME | DISCIPLINES | CREATED_AT | UPDATED_AT | PIN_HASH |
|----|-------|------|-------------|------------|------------|----------|

### Visits Sheet
| ID | USER_ID | TIMESTAMP | REASON | DISCIPLINES |
|----|---------|-----------|--------|-------------|

## ⚠️ Important Notes

1. **PIN Security**: PINs are hashed with SHA-256 + salt, never stored in plaintext
2. **Account Required**: Users MUST register before they can login
3. **Unique Email**: Each email can only register once
4. **4-Digit PIN**: PIN must be exactly 4 digits (0000-9999)

## 🐛 If Something Breaks

1. Check Vercel logs for detailed error messages
2. Run `node clear-sheets.js` to reset data
3. Try registering a new account
4. Check that Google Sheets has the correct column headers
