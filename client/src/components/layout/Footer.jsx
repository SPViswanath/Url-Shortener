import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#353849] py-8 relative overflow-hidden text-gray-300">
      {/* Subtle top border gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)]/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        
        {/* Left Side: Logo & Tagline */}
        <div className="text-center md:text-left group cursor-default">
          <Link to="/" className="inline-block font-['Pacifico'] text-3xl text-[var(--color-primary)] hover:-translate-y-0.5 hover:drop-shadow-lg transition-transform duration-300 mb-1">
            shortly
          </Link>
          <p className="mt-1 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            Making the web a little shorter, one link at a time.
          </p>
        </div>
        
        {/* Right Side: Copyright */}
        <div className="mt-6 md:mt-0">
          <p className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
            &copy; {new Date().getFullYear()} Shortly. All rights reserved.
          </p>
        </div>
        
      </div>
    </footer>
  );
}
