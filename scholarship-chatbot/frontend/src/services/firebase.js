// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCL6R3Tnie6NruMqeUzYSKmObFWdoFp8P8",
    authDomain: "ednt-9dbff.firebaseapp.com",
    projectId: "ednt-9dbff",
    storageBucket: "ednt-9dbff.firebasestorage.app",
    messagingSenderId: "190809965504",
    appId: "1:190809965504:web:7fccf33b824211f768fe25",
    measurementId: "G-7D3YXFTDDY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export default app;
