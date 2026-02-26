# Authentication Troubleshooting Guide

## Issue: "Invalid credentials" error on login

### Step 1: Check Appwrite Console
1. Go to https://cloud.appwrite.io
2. Select your project
3. Click "Auth" → "Users"
4. Look for your email in the user list

### Step 2: If user exists in Auth but login fails

**Option A: Delete and recreate**
1. In Appwrite Console → Auth → Users
2. Find your user
3. Click the three dots → Delete
4. Go back to your app
5. Sign up again with the same email

**Option B: Check database sync**
1. In Appwrite Console → Databases → Your Database
2. Click "users" collection
3. Check if a document exists with your email
4. If missing, the user was created in Auth but not in the database

### Step 3: If user doesn't exist in Auth

**The account was never created successfully**
1. Try signing up again
2. Check browser console (F12) for errors
3. Common issues:
   - Missing environment variables
   - Wrong collection IDs
   - Permission issues

### Step 4: Verify Environment Variables

Check your `.env.local` file has:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_actual_database_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_actual_users_collection_id
```

### Step 5: Test with a fresh account

1. Use a completely new email (e.g., test123@example.com)
2. Use a strong password (at least 8 characters)
3. Try signing up
4. If successful, the issue was with your previous account

## Quick Fix: Reset Everything

1. **Delete user from Appwrite Auth**
   - Appwrite Console → Auth → Users → Delete

2. **Delete user from Database**
   - Appwrite Console → Databases → users collection → Delete document

3. **Clear browser data**
   - Press F12 → Application tab → Clear storage

4. **Sign up fresh**
   - Use the same or different email
   - Create new password

## Still not working?

Check these:
- [ ] Appwrite project is active
- [ ] Email/Password auth is enabled in Appwrite
- [ ] Users collection has correct permissions (Any role)
- [ ] All environment variables are correct
- [ ] No typos in email/password
- [ ] Password is at least 8 characters
