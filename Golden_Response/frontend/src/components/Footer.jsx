import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Send, Github, Twitter, Linkedin, Heart } from 'lucide-react';
import { useLMS } from '../context/LMSContext';

const Footer = () => {
  const { triggerAlert } = useLMS();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      triggerAlert('error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      triggerAlert('success', 'Thank you for subscribing to our newsletter! Weekly updates are on the way.');
      setEmail('');
      setLoading(false);
    }, 1200);
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Pitch */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigoPrimary to-violetAccent text-white shadow-neon-indigo group-hover:scale-105 transition-transform duration-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                LMS<span className="text-violetAccent">Academy</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 text-slate-400">
              An elite, high-performance personal Learning Management System designed to wow students, elevate instruction, and make modern education delightful.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors" aria-label="Twitter link">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors" aria-label="Github link">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors" aria-label="LinkedIn link">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Course Catalog</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Become an Instructor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Enterprise solutions</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API References</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Platform Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy & Terms</a></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Stay Updated</h3>
            <p className="text-sm leading-relaxed mb-4">
              Get the latest courses, tech breakdowns, and visual design milestones delivered straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigoPrimary rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all pr-12"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 p-2 rounded-lg bg-indigoPrimary text-white hover:bg-violetAccent hover:shadow-neon-violet transition-all disabled:opacity-50"
                aria-label="Subscribe to newsletter"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Branding Credit */}
        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; 2026 LMS Academy. Designed and engineered for peak performance.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-roseAccent fill-current animate-pulse" /> by Antigravity AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
