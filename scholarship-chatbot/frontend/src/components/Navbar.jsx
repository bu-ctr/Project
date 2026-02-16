import { Link, useLocation } from "react-router-dom";
import { isLoggedIn, logout } from "../utils/auth";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const loggedIn = isLoggedIn();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${isActive(to)
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
        : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
        }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 text-white p-2 rounded-lg group-hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              <span className="text-xl font-bold">En</span>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              EduNext
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/chatbot">AI Assistant</NavLink>

            {loggedIn ? (
              <>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <NavLink to="/scholarships">Scholarships</NavLink>
                <NavLink to="/internships">Internships</NavLink>
                <NavLink to="/competitions">Competitions</NavLink>
                <NavLink to="/gpa-calculator">GPA Calculator</NavLink>
                <NavLink to="/profile">Profile</NavLink>
                <div className="ml-2">
                  <NotificationBell />
                </div>
                <button
                  onClick={logout}
                  className="ml-4 px-5 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-lg text-gray-700 font-semibold hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:shadow-2xl hover:shadow-indigo-300 hover:scale-105 shadow-xl shadow-indigo-200 transition-all duration-300 animate-pulse-glow"
                >
                  Sign Up Free →
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - simplified */}
          <div className="md:hidden">
            {/* Mobile menu implementation optional for now, sticking to desktop focus as requested "website" */}
          </div>
        </div>
      </div>
    </nav>
  );
}
