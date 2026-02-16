import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Scholarships from "./pages/Scholarships";
import ScholarshipDetail from "./pages/ScholarshipDetail";
import Internships from "./pages/Internships";
import Competitions from "./pages/Competitions";
import ChatbotPage from "./pages/ChatbotPage";
import NotificationsPage from "./pages/NotificationsPage";
import GPACalculator from "./pages/GPACalculator";

/* ---------- AUTH GUARD ---------- */
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  /* sync login/logout across app */
  useEffect(() => {
    const updateAuth = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("token")));
    };

    window.addEventListener("auth-change", updateAuth);
    return () => window.removeEventListener("auth-change", updateAuth);
  }, []);

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chatbot" element={<ChatbotPage />} />

        {/* Protected routes */}
        <Route path="/" element={<Home />} />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        <Route
          path="/scholarships"
          element={<Scholarships />}
        />

        <Route
          path="/scholarships/:id"
          element={<ScholarshipDetail />}
        />

        <Route
          path="/internships"
          element={<Internships />}
        />

        <Route
          path="/competitions"
          element={<Competitions />}
        />

        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          }
        />

        <Route path="/gpa-calculator" element={<GPACalculator />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
