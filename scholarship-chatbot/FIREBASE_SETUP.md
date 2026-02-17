# Firebase Google Authentication Setup Guide

## Overview
This guide explains how to configure and use the Firebase Google authentication integration in the scholarship-chatbot project.

## What's Been Implemented

✅ **Frontend**:
- Firebase SDK initialized with your project credentials
- Google Sign-In buttons on Login and Signup pages
- AuthContext for managing authentication state

✅ **Backend**:
- Firebase Admin SDK configuration
- `/google-login` endpoint for token verification
- Updated user creation to support Google authentication

✅ **Database**:
- Added `auth_provider` column (values: 'email' or 'google')
- Added `google_id` column to store unique Google user ID
- Made `password_hash` nullable for Google-only users

## Firebase Console Setup (Already Done!)

Your Firebase project is already configured with these credentials:
- **Project ID**: `edunext-484715`
- **Auth Domain**: `edunext-484715.firebaseapp.com`

### Enable Google Sign-In (Required)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **edunext-484715**
3. Navigate to **Authentication** > **Sign-in method**
4. Click on **Google** provider
5. Toggle **Enable** to turn it on
6. Add your project's support email
7. Click **Save**

## How It Works

### User Flow

1. **New User Signs Up with Google**:
   - Clicks "Sign up with Google" button
   - Selects their Google account
   - Firebase creates authentication
   - Backend creates user record with `auth_provider='google'`
   - User profile is created with their Google name
   - JWT token is returned for session management

2. **Existing User Logs In with Google**:
   - Clicks "Sign in with Google" button
   - Selects their Google account
   - Backend verifies the user exists
   - JWT token is returned

3. **Email/Password Authentication** (Still Works!):
   - Traditional login/signup continues to function
   - Users with `auth_provider='email'` have password hashes
   - Users with `auth_provider='google'` do not have passwords

## Testing the Integration

### 1. Start the Development Servers

**Frontend**:
```bash
cd frontend
npm run dev
```

**Backend**:
```bash
cd backend
npm start
```

### 2. Test Google Sign-Up

1. Navigate to `http://localhost:5173/signup`
2. Click "Sign up with Google"
3. Complete Google authentication
4. Verify you're redirected to the profile page
5. Check that your user record was created in the database

### 3. Test Google Sign-In

1. Navigate to `http://localhost:5173/login`
2. Click "Sign in with Google"
3. Complete Google authentication
4. Verify you're logged in and redirected to profile

### 4. Verify Database

Check your PostgreSQL database:
```sql
SELECT id, email, auth_provider, google_id FROM users;
```

You should see:
- Email/password users with `auth_provider='email'` and `google_id` NULL
- Google users with `auth_provider='google'` and a `google_id` value

## Troubleshooting

### "Firebase authentication not configured" error

**Cause**: Firebase Admin SDK is not properly initialized.

**Solution**: The current configuration uses a simple projectId-based initialization. For production, you should:

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Save it in `backend/src/config/serviceAccountKey.json`
5. Update `firebaseAdmin.js` to use the service account:

```javascript
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### Google Sign-In popup blocked

**Cause**: Browser popup blocker.

**Solution**: Allow popups for localhost in your browser settings.

### "Invalid token" error

**Cause**: Token verification failed.

**Solution**: 
- Ensure Google Sign-In is enabled in Firebase Console
- Check that Firebase Admin SDK is properly initialized
- Verify the Firebase config matches your project

## Security Considerations

### Current Setup (Development)
- Firebase Admin initialized with just projectId
- Works for testing but less secure

### Production Setup (Recommended)
- Use Firebase Admin service account key
- Store service account key securely (not in git)
- Add proper error handling and logging
- Implement rate limiting on auth endpoints

## Environment Variables

The implementation uses these from your Firebase config:
- Project ID: `edunext-484715`
- API Key: included in frontend config
- Auth Domain: `edunext-484715.firebaseapp.com`

## Next Steps

1. ✅ Enable Google Sign-In in Firebase Console
2. ✅ Test the authentication flow
3. ⚠️ (Optional) Configure Firebase Admin service account for production
4. ✅ Deploy and enjoy secure Google authentication!

## Support

If you encounter any issues:
1. Check browser console for frontend errors
2. Check backend logs for server errors
3. Verify Firebase Console settings
4. Ensure database schema is updated (migrations run automatically on server start)
