# Google Authentication Setup Guide

## Current Issue

You're seeing: **"Authentication failed. Please try again later."**

This happens because the Firebase Admin SDK needs a **service account key** to verify Google ID tokens, but currently Firebase Admin is initialized with "Application Default Credentials" which doesn't have the necessary permissions.

## Solution: Download Firebase Service Account Key

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **edunext-484715**

### Step 2: Generate Service Account Key

1. Click the ⚙️ (gear icon) next to "Project Overview"
2. Select **"Project settings"**
3. Go to the **"Service accounts"** tab
4. Click **"Generate new private key"**
5. Click **"Generate key"** in the confirmation dialog
6. A JSON file will be downloaded (e.g., `edunext-484715-firebase-adminsdk-xxxxx.json`)

### Step 3: Install the Service Account Key

**Option A: Put file in backend directory (Recommended)**

1. Rename the downloaded file to: `firebase-service-account.json`
2. Move it to: `c:\Users\EASHAN\Desktop\122\scholarship-chatbot\scholarship-chatbot\backend\`
3. Update `.env` file:
   ```bash
   # Firebase Service Account (optional - for Google Sign-In)
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```
4. Restart the backend server

**Option B: Use environment variable**

1. Open the downloaded JSON file in a text editor
2. Copy the entire content (it should be a single line of JSON)
3. Add to `.env` file:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...entire JSON here...}'
   ```
4. Restart the backend server

### Step 4: Verify Setup

1. Restart the backend: Stop the current server (Ctrl+C) and run `npm start`
2. Look for this message in console:
   ```
   ✓ Firebase Admin: Using service account from file
   ```
   OR
   ```
   ✓ Firebase Admin: Using service account from environment
   ```
3. Try Google Sign-In again - it should work now!

## Expected Backend Log (Success)

When Google authentication works, you should see:

```
Google login: Verifying Firebase ID token...
Google login: Token verified for user: youremail@gmail.com (uid: xxxxx)
Google login: Creating new user for youremail@gmail.com
Google login: New user created with ID: 1
Google login: Success! JWT token generated for user 1
```

## Troubleshooting

### Still getting errors?

Check the backend console for detailed error messages. Common issues:

1. **File path incorrect**: Make sure the path in `.env` matches where you saved the file
2. **Invalid JSON**: If using env variable, ensure JSON is valid and wrapped in quotes
3. **Wrong project**: Ensure you downloaded the key for `edunext-484715` project
4. **Permissions**: The service account needs "Firebase Admin SDK Service Agent" role (should be automatic)

### Need more help?

Run this command to test if the service account loaded correctly:

```bash
cd backend
npm start
```

Look for these lines in the output:
- ✅ Good: `✓ Firebase Admin: Using service account from file`
- ❌ Bad: `⚠ Firebase Admin: Using projectId only (limited functionality)`

## Security Note

⚠️ **IMPORTANT**: Never commit `firebase-service-account.json` to Git!

The `.gitignore` should already include it, but double-check:

```bash
# In backend/.gitignore
firebase-service-account.json
```
