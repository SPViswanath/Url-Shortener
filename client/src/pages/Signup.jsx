/**
 * Signup.jsx
 * 
 * User registration page.
 * Supports email/password account creation and Google OAuth signup.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { ArrowRight, Mail, Lock, User } from "lucide-react";
import * as authApi from "../services/authApi";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, googleLoginSuccess } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    const result = await signup({ name, email, password });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Account created successfully!");
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
      toast.success("Account created with Google!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Google signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-row-reverse overflow-hidden">
      {/* Right Panel - Form (Reversed layout for Signup to differentiate from Login) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 bg-[var(--color-surface)]">
        <div className="max-w-[400px] w-full mx-auto">
          <div className="text-center mb-10">
            <Link to="/" className="font-['Pacifico'] text-4xl text-[var(--color-primary)] inline-block">
              shortly
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text-main)] mb-2">Create an account</h1>
            <p className="text-[var(--color-text-muted)]">Start shortening links today. It's free.</p>
          </div>

          <div className="mb-6 flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google signup was unsuccessful")}
              useOneTap
              theme="outline"
              shape="rectangular"
              text="signup_with"
              size="large"
            />
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--color-surface)] text-gray-500">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 flex justify-center items-center text-lg mt-4"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
              {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
              Sign in
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
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Built for scale.</h2>
          <p className="text-gray-300 text-xl max-w-md">
            Join thousands of professionals who rely on <span className="font-['Pacifico'] text-[var(--color-primary)] tracking-wide">shortly</span> to track and optimize their URLs every day.
          </p>
        </div>
      </div>
    </div>
  );
}
