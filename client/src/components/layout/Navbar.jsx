/**
 * Navbar.jsx
 * 
 * Top navigation bar component.
 * Displays logo, public links (Login/Signup), and authenticated user profile dropdown.
 */
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User, LogOut, Mail, Settings, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#f4f1de]/90 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/" 
              className="font-['Pacifico'] text-3xl text-[var(--color-primary)] tracking-wide hover:opacity-90 transition-opacity"
            >
              shortly
            </Link>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/login" className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link to="/dashboard" className="hidden md:flex text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors">
                  Dashboard
                </Link>
                
                {/* Profile Dropdown (Modal-like) */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 focus:outline-none group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[#c5654c] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:shadow-md transition-all">
                      {getInitials(user?.name)}
                    </div>
                    <span className="hidden md:block font-medium text-[var(--color-secondary)] group-hover:text-[var(--color-primary)] transition-colors">
                      {user?.name?.split(' ')[0] || "Profile"}
                    </span>
                  </button>

                  {/* Profile Modal / Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right z-50">
                      
                      {/* Header */}
                      <div className="bg-gray-50 p-5 border-b border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[#c5654c] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {getInitials(user?.name)}
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-bold text-[var(--color-secondary)] text-lg truncate">{user?.name || "User"}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-0.5">
                              <Mail className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{user?.email || "No email provided"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Action */}
                      <div className="p-2 bg-gray-50">
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3 text-red-500" />
                          Sign Out
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
