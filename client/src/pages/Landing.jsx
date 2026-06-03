import { Link } from "react-router-dom";
import { 
  Link as LinkIcon, 
  BarChart3, 
  Settings2, 
  Clock, 
  QrCode, 
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import CreateLinkModal from "../components/dashboard/CreateLinkModal";

const RevealOnScroll = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [landingUrl, setLandingUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 10);
  }, []);

  const handleShorten = () => {
    if (!landingUrl) return;
    if (!user) {
      // User is unauthenticated, direct to login
      navigate('/login');
    } else {
      // User is authenticated, open modal directly on landing page
      setIsModalOpen(true);
    }
  };

  const features = [
    {
      name: "Powerful Analytics",
      description: "Track clicks, device types, browsers, and referring sources in real-time.",
      icon: BarChart3,
    },
    {
      name: "Link Expiration",
      description: "Set links to expire on a specific date. Perfect for time-sensitive campaigns.",
      icon: Clock,
    },
    {
      name: "Manage & Edit",
      description: "Made a mistake? Easily update the destination URL of any short link at any time.",
      icon: Settings2,
    },
    {
      name: "QR Code Generation",
      description: "Instantly generate high-quality QR codes for your short links for offline marketing.",
      icon: QrCode,
    },
    {
      name: "Bulk Processing",
      description: "Save time by uploading a CSV to shorten hundreds of URLs at once with custom settings.",
      icon: FileSpreadsheet,
    },
    {
      name: "Fast & Secure",
      description: "Built on high-performance infrastructure ensuring lightning-fast redirects and top-tier security.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-10 w-72 h-72 bg-[var(--color-accent)] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-40 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <Zap className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-sm font-medium text-[var(--color-text-main)]">The modern way to manage links</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-[var(--color-text-main)] tracking-tight mb-6 leading-tight">
              Shorten URLs. <br className="hidden md:block" />
              <span className="text-[var(--color-primary)] relative">
                Broaden your reach.
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[var(--color-accent)] opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="transparent" />
                </svg>
              </span>
            </h1>
            
            <p className="mt-4 max-w-2xl mx-auto text-xl text-[var(--color-text-muted)] mb-10">
              A beautifully crafted, privacy-first URL shortener designed for professionals. Track performance, customize destinations, and manage your links in one elegant dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/signup" className="w-full sm:w-auto btn-primary text-lg px-8 py-3 flex items-center justify-center">
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto text-[var(--color-secondary)] font-medium hover:text-[var(--color-primary)] transition-colors text-lg">
                Log in to account
              </Link>
            </div>
          </div>
        </section>

        {/* URL Shortener Preview / Trust Banner */}
        <section className="pb-24">
          <RevealOnScroll className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-2 sm:p-4 flex flex-col sm:flex-row items-center border border-gray-100">
              <div className="flex-grow w-full flex items-center bg-gray-50 rounded-xl px-4 py-3 mb-3 sm:mb-0 sm:mr-3 border border-gray-200 focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)] transition-all">
                <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                <input 
                  type="text" 
                  value={landingUrl}
                  onChange={(e) => setLandingUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                  placeholder="Paste your long link here..." 
                  className="w-full bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              <button 
                onClick={handleShorten}
                className="w-full sm:w-auto btn-primary whitespace-nowrap py-3 px-6 shadow-md hover:shadow-lg"
              >
                Shorten Now
              </button>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              Join thousands of users who trust <span className="font-['Pacifico'] text-[var(--color-primary)]">shortly</span> for their link management.
            </p>
          </RevealOnScroll>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white/50 border-t border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RevealOnScroll className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-main)] mb-4">Everything you need to manage links</h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                Stop using generic link shorteners. Take control of your audience with our comprehensive suite of tools.
              </p>
            </RevealOnScroll>

            <RevealOnScroll className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 bg-[var(--color-background)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text-main)] mb-3">{feature.name}</h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </RevealOnScroll>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 overflow-hidden">
          <RevealOnScroll className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[var(--color-secondary)] rounded-3xl overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-secondary)] to-[#2a2d42] opacity-90"></div>
              
              {/* Decorative circles */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-primary)] rounded-full mix-blend-overlay filter blur-2xl opacity-50"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--color-accent)] rounded-full mix-blend-overlay filter blur-2xl opacity-50"></div>
              
              <div className="relative px-6 py-16 sm:px-12 sm:py-20 md:p-24 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to make every link count?</h2>
                <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
                  Start using <span className="font-['Pacifico'] text-[var(--color-primary)]">shortly</span> today and experience the difference of a premium URL management platform.
                </p>
                <Link to="/signup" className="inline-flex items-center justify-center bg-white text-[var(--color-secondary)] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg hover:-translate-y-1">
                  Create your free account
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </section>
      </main>

      <Footer />
      
      <CreateLinkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialUrl={landingUrl}
      />
    </div>
  );
}
