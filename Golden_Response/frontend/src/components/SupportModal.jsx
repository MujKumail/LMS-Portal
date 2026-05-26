import React, { useState, useEffect } from 'react';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import { X, Send, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SupportModal = () => {
  const { user } = useAuth();
  const { isSupportModalOpen, setIsSupportModalOpen, submitSupportTicket } = useLMS();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Query');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-populate user parameters if logged in
  useEffect(() => {
    if (user && isSupportModalOpen) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user, isSupportModalOpen]);

  const handleClose = () => {
    setIsSupportModalOpen(false);
    setMessage('');
    setErrors({});
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name || !name.trim()) newErrors.name = 'Please provide your name.';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.trim()) {
      newErrors.email = 'Please provide your email address.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please provide a valid email structure.';
    }

    if (!message || !message.trim()) {
      newErrors.message = 'Please provide a message query description.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    
    const result = await submitSupportTicket(name, email, subject, message);
    setLoading(false);

    if (result.success) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md glass-panel rounded-3xl border border-slate-800 shadow-2xl p-6 overflow-hidden z-10"
            role="dialog"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violetAccent/10 text-violetAccent">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h2 id="modal-title" className="text-xl font-bold text-white">Contact Academic Support</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Support Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="support-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  id="support-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-slate-950/60 border ${errors.name ? 'border-roseAccent/60 focus:ring-roseAccent' : 'border-slate-800 focus:border-indigoPrimary'} rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all`}
                  placeholder="E.g. Sarah Connor"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-roseAccent flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="support-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  id="support-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-950/60 border ${errors.email ? 'border-roseAccent/60 focus:ring-roseAccent' : 'border-slate-800 focus:border-indigoPrimary'} rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all`}
                  placeholder="E.g. student@lms.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-roseAccent flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="support-subject" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Inquiry Category
                </label>
                <select
                  id="support-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigoPrimary rounded-xl py-2.5 px-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigoPrimary"
                >
                  <option value="Course Issue">Course Material Issue</option>
                  <option value="Technical Problem">Platform Technical Problem</option>
                  <option value="General Query">General Academic Query</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="support-message" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Your Message
                </label>
                <textarea
                  id="support-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="4"
                  className={`w-full bg-slate-950/60 border ${errors.message ? 'border-roseAccent/60 focus:ring-roseAccent' : 'border-slate-800 focus:border-indigoPrimary'} rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all resize-none`}
                  placeholder="Describe your issue or question in detail..."
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-roseAccent flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.message}
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 mt-2 py-3 rounded-xl bg-gradient-to-r from-indigoPrimary to-violetAccent text-white text-sm font-semibold hover:shadow-neon-violet transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Support Request
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SupportModal;
