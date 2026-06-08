/**
 * Login.jsx
 * 
 * User login page.
 * Supports email/password authentication and Google OAuth login.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { ArrowRight, Mail, Lock } from "lucide-react";
import * as authApi from "../services/authApi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, googleLoginSuccess } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    const result = await login({ email, password });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(result.error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsSubmitting(true);
      await authApi.googleLogin(credentialResponse.credential);
      await googleLoginSuccess();
      toast.success("Successfully logged in with Google!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Google login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-row-reverse overflow-hidden">
      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 bg-[var(--color-surface)]">
        <div className="max-w-[400px] w-full mx-auto">
          <div className="text-center mb-10">
            <Link to="/" className="font-['Pacifico'] text-4xl text-[var(--color-primary)] inline-block">
              shortly
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text-main)] mb-2">Welcome back</h1>
            <p className="text-[var(--color-text-muted)]">Please enter your details to sign in.</p>
          </div>

          <div className="mb-6 flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login was unsuccessful")}
              useOneTap
              theme="outline"
              shape="rectangular"
              text="continue_with"
              size="large"
            />
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--color-surface)] text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 flex justify-center items-center text-lg mt-6"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
              {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Left Panel - Visual */}
      <div className="hidden lg:block lg:w-1/2 bg-[var(--color-secondary)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-secondary)] to-[#2a2d42]"></div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)] rounded-full mix-blend-overlay filter blur-[100px] opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-accent)] rounded-full mix-blend-overlay filter blur-[100px] opacity-30"></div>

        <div className="absolute inset-0 flex flex-col justify-center items-center px-16 text-center z-10">
          <div className="mb-10 w-24 h-24 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20">
            <svg className="w-12 h-12 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Welcome back.</h2>
          <p className="text-gray-300 text-xl max-w-md">
            Access your dashboard to manage your links, view analytics, and optimize your reach with <span className="font-['Pacifico'] text-[var(--color-primary)] tracking-wide">shortly</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
