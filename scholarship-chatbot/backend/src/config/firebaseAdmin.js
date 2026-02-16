// Firebase Admin SDK configuration
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with proper credentials
let firebaseAdmin = null;
let authInstance = null;

try {
    // Check if already initialized
    if (admin.apps.length > 0) {
        firebaseAdmin = admin.app();
        authInstance = admin.auth();
        console.log('✓ Firebase Admin already initialized');
    } else {
        let initConfig = null;

        // Try to load service account from file if path is provided
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

        if (serviceAccountPath) {
            const absolutePath = path.resolve(serviceAccountPath);

            if (fs.existsSync(absolutePath)) {
                try {
                    const serviceAccount = require(absolutePath);
                    initConfig = {
                        credential: admin.credential.cert(serviceAccount),
                        projectId: serviceAccount.project_id
                    };
                    console.log('✓ Firebase Admin: Using service account from file');
                } catch (readError) {
                    console.error('✗ Error reading service account file:', readError.message);
                }
            } else {
                console.warn(`⚠ Service account file not found at: ${absolutePath}`);
            }
        }

        // Fallback: Try to use service account from environment variable (JSON string)
        if (!initConfig && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            try {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
                initConfig = {
                    credential: admin.credential.cert(serviceAccount),
                    projectId: serviceAccount.project_id
                };
                console.log('✓ Firebase Admin: Using service account from environment');
            } catch (parseError) {
                console.error('✗ Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', parseError.message);
            }
        }

        // Fallback: Use Application Default Credentials (ADC) or projectId only
        if (!initConfig) {
            const projectId = process.env.FIREBASE_PROJECT_ID || 'edunext-484715';

            try {
                // Try ADC first (works in Google Cloud environments)
                initConfig = {
                    credential: admin.credential.applicationDefault(),
                    projectId: projectId
                };
                console.log('✓ Firebase Admin: Using Application Default Credentials');
            } catch (adcError) {
                // Final fallback: projectId only (limited functionality)
                initConfig = { projectId: projectId };
                console.warn('⚠ Firebase Admin: Using projectId only (limited functionality)');
                console.warn('⚠ Google Sign-In may NOT work without proper credentials');
                console.warn('⚠ To fix: Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON');
            }
        }

        // Initialize with the determined config
        firebaseAdmin = admin.initializeApp(initConfig);
        authInstance = admin.auth();
        console.log('✓ Firebase Admin initialized successfully');
    }
} catch (error) {
    console.error('✗ CRITICAL: Error initializing Firebase Admin:', error.message);
    console.error('✗ Stack:', error.stack);
    console.warn('⚠ Firebase authentication will NOT work!');
    console.warn('⚠ To fix this:');
    console.warn('  1. Download service account JSON from Firebase Console');
    console.warn('  2. Set FIREBASE_SERVICE_ACCOUNT_PATH in .env file');
    console.warn('  3. Or set FIREBASE_SERVICE_ACCOUNT_JSON as JSON string');
}

module.exports = {
    admin,
    auth: authInstance,
    isConfigured: authInstance !== null
};
