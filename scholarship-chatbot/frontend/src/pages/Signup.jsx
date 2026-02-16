import { useState } from "react";
import api from "../services/api";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { email, password });
      alert("Signup successful. Please login.");
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setLoading(true);
    setError("");

    try {
      console.log("Google Sign-Up: Starting authentication...");

      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Sign-Up: Popup completed, user:", result.user.email);

      const idToken = await result.user.getIdToken();
      console.log("Google Sign-Up: ID token obtained");

      // Send token to backend
      console.log("Google Sign-Up: Sending token to backend...");
      const res = await api.post("/auth/google-login", { idToken });

      console.log("Google Sign-Up: Backend response received");
      localStorage.setItem("token", res.data.token);
      window.dispatchEvent(new Event("auth-change"));

      console.log("Google Sign-Up: Success! Redirecting to profile...");
      window.location.href = "/profile";
    } catch (err) {
      console.error("Google sign-up error:", err);

      // Extract error message from backend response
      let errorMessage = "Failed to sign up with Google. Please try again.";

      if (err.response?.data) {
        console.error("Backend error response:", err.response.data);

        // Use specific error message from backend if available
        if (err.response.data.error) {
          errorMessage = err.response.data.error;

          // Add details if available in development
          if (err.response.data.details) {
            console.error("Error details:", err.response.data.details);
          }
        }
      } else if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-up cancelled. Please try again.";
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = "Popup blocked by browser. Please allow popups and try again.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (err.message) {
        console.error("Error message:", err.message);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        Create Account
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="At least 6 characters"
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignUp}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign up with Google
      </button>

      <p className="mt-6 text-center text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-indigo-600 font-semibold hover:underline">
          Login
        </a>
      </p>
    </div>
  );
}
