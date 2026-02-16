const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { auth: firebaseAuth } = require("../config/firebaseAdmin");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password too short" });
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    await db.query(
      "INSERT INTO users (email, password_hash, auth_provider) VALUES ($1, $2, $3)",
      [email.toLowerCase(), hash, 'email']
    );
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const r = await db.query("SELECT * FROM users WHERE email=$1", [
    email.toLowerCase()
  ]);

  if (r.rows.length === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = r.rows[0];

  if (!user.password_hash) {
    return res.status(401).json({ error: "Please sign in with Google" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);

  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

// GOOGLE LOGIN
router.post("/google-login", async (req, res) => {
  const { idToken } = req.body;

  // Validate input
  if (!idToken) {
    console.error("Google login: ID token missing in request");
    return res.status(400).json({ error: "ID token is required" });
  }

  try {
    // Check if Firebase Auth is initialized
    if (!firebaseAuth) {
      console.error("CRITICAL: Firebase Auth not initialized - check firebaseAdmin.js");
      return res.status(500).json({
        error: "Server configuration error: Firebase authentication not available",
        details: "Contact administrator - Firebase service account not configured"
      });
    }

    console.log("Google login: Verifying Firebase ID token...");

    // Verify the Firebase ID token
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const { email, uid, name, picture } = decodedToken;

    console.log(`Google login: Token verified for user: ${email} (uid: ${uid})`);

    if (!email) {
      console.error("Google login: Email not found in decoded token");
      return res.status(400).json({ error: "Email not found in Google account" });
    }

    // Check if user exists
    let userResult = await db.query("SELECT * FROM users WHERE email=$1", [
      email.toLowerCase()
    ]);

    let userId;

    if (userResult.rows.length === 0) {
      // Create new user
      console.log(`Google login: Creating new user for ${email}`);

      const insertResult = await db.query(
        "INSERT INTO users (email, auth_provider, google_id) VALUES ($1, $2, $3) RETURNING id",
        [email.toLowerCase(), 'google', uid]
      );
      userId = insertResult.rows[0].id;

      console.log(`Google login: New user created with ID: ${userId}`);

      // Create profile entry if name is available
      if (name) {
        await db.query(
          "INSERT INTO profiles (user_id, full_name) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING",
          [userId, name]
        );
        console.log(`Google login: Profile created with name: ${name}`);
      }
    } else {
      userId = userResult.rows[0].id;
      console.log(`Google login: Existing user found with ID: ${userId}`);

      // Update google_id if not set
      if (!userResult.rows[0].google_id) {
        await db.query(
          "UPDATE users SET google_id=$1, auth_provider=$2 WHERE id=$3",
          [uid, 'google', userId]
        );
        console.log(`Google login: Updated user ${userId} with Google ID`);
      }
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL: JWT_SECRET not configured in environment");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log(`Google login: Success! JWT token generated for user ${userId}`);

    res.json({ token, userId, email });
  } catch (error) {
    console.error("Google login error:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error code:", error.code);

    // Provide specific error messages based on error type
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: "Google sign-in session expired. Please try again."
      });
    } else if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        error: "Invalid Google sign-in token. Please try again."
      });
    } else if (error.code === 'auth/argument-error') {
      return res.status(400).json({
        error: "Invalid authentication request. Please try again."
      });
    } else if (error.code?.startsWith('auth/')) {
      return res.status(401).json({
        error: `Authentication error: ${error.message}`
      });
    }

    // Database or other errors
    res.status(500).json({
      error: "Authentication failed. Please try again later.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
