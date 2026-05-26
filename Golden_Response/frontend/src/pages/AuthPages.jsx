import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, AlertCircle, Shield, ArrowLeft, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPages = () => {
  const { login, register, forgotPassword, googleLogin } = useAuth();
  const { triggerAlert } = useLMS();
  const navigate = useNavigate();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrors({});
    setPassword('');
    // preserve email/name if they typed it
  };

  const handleValidation = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'register' && (!name || !name.trim())) {
      newErrors.name = 'Please enter your name.';
    }

    if (!email || !email.trim()) {
      newErrors.email = 'Please enter your email.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email formatting.';
    }

    if (mode !== 'forgot') {
      if (!password) {
        newErrors.password = 'Please enter a password.';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be 6+ characters.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidation()) return;

    setLoading(true);
    let result = null;

    if (mode === 'login') {
      result = await login(email, password);
    } else if (mode === 'register') {
      result = await register(name, email, password, role);
    } else if (mode === 'forgot') {
      result = await forgotPassword(email);
    }

    setLoading(false);

    if (result && result.success) {
      triggerAlert('success', result.message);
      if (mode === 'forgot') {
        handleModeChange('login');
      } else {
        // Direct dashboard routing based on active role
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser.role === 'instructor') {
          navigate('/instructor/dashboard');
        } else if (storedUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } else if (result && result.error) {
      triggerAlert('error', result.error);
    }
  };

  // Mock Google Authentication Flow for one-click test
  const handleGoogleLoginMock = async () => {
    setLoading(true);
    const mockPayload = {
      email: 'student@lms.com',
      name: 'Sarah Connor',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      googleId: 'g_mock_12345'
    };
    
    const result = await googleLogin(mockPayload);
    setLoading(false);

    if (result && result.success) {
      triggerAlert('success', 'Logged in successfully using Google Mock Authentication!');
      navigate('/student/dashboard');
    } else {
      triggerAlert('error', result.error || 'Google login mock failure.');
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4 relative bg-grid-mesh">
      {/* Glow backgrounds */}
      <div className="absolute top-[20%] left-[20%] w-[35%] h-[35%] bg-indigoPrimary/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[35%] h-[35%] bg-violetAccent/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Upper Brand Info */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigoPrimary to-violetAccent text-white shadow-neon-indigo group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              LMS<span className="text-violetAccent">Academy</span>
            </span>
          </Link>
          <p className="text-slate-400 text-sm">Elevate your modern workspace competency</p>
        </div>

        {/* Dynamic transition container */}
        <div className="glass-panel border border-slate-800/80 shadow-2xl rounded-3xl overflow-hidden p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'register' ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'register' ? -30 : 30 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot' && 'Password Recovery'}
              </h2>
              <p className="text-slate-400 text-sm font-light mb-6">
                {mode === 'login' && 'Sign in to access your modules'}
                {mode === 'register' && 'Start your customized learning path today'}
                {mode === 'forgot' && 'Enter your email to receive recovery parameters'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name (Register mode only) */}
                {mode === 'register' && (
                  <div>
                    <label htmlFor="auth-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-4 w-4 h-4 text-slate-500" />
                      <input
                        id="auth-name"
                        type="text"
                        placeholder="E.g. Sarah Connor"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full bg-slate-950/60 border ${errors.name ? 'border-roseAccent/60 focus:ring-roseAccent' : 'border-slate-800 focus:border-indigoPrimary'} rounded-xl py-2.5 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-xs text-roseAccent flex items-center gap-1 font-medium"><AlertCircle className="w-3.5 h-3.5" /> {errors.name}</p>
                    )}
                  </div>
                )}

                {/* Email (All modes) */}
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-4 h-4 text-slate-500" />
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="student@lms.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-slate-950/60 border ${errors.email ? 'border-roseAccent/60 focus:ring-roseAccent' : 'border-slate-800 focus:border-indigoPrimary'} rounded-xl py-2.5 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-roseAccent flex items-center gap-1 font-medium"><AlertCircle className="w-3.5 h-3.5" /> {errors.email}</p>
                  )}
                </div>

                {/* Password (Login / Register only) */}
                {mode !== 'forgot' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => handleModeChange('forgot')}
                          className="text-xs text-violetAccent hover:text-white font-medium transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-4 h-4 text-slate-500" />
                      <input
                        id="auth-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full bg-slate-950/60 border ${errors.password ? 'border-roseAccent/60 focus:ring-roseAccent' : 'border-slate-800 focus:border-indigoPrimary'} rounded-xl py-2.5 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all`}
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-roseAccent flex items-center gap-1 font-medium"><AlertCircle className="w-3.5 h-3.5" /> {errors.password}</p>
                    )}
                  </div>
                )}

                {/* Role Switch Selection (Register mode only) */}
                {mode === 'register' && (
                  <div>
                    <label htmlFor="auth-role" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Account Objective</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all ${
                          role === 'student'
                            ? 'bg-slate-900 border-indigoPrimary text-white'
                            : 'border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        Enroll as Learner
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('instructor')}
                        className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all ${
                          role === 'instructor'
                            ? 'bg-slate-900 border-indigoPrimary text-white'
                            : 'border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        Teach a Course
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 mt-4 py-3 rounded-xl bg-gradient-to-r from-indigoPrimary to-violetAccent text-white text-sm font-semibold hover:shadow-neon-violet transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'register' && 'Register Now'}
                      {mode === 'forgot' && 'Send Recovery Instructions'}
                    </>
                  )}
                </button>
              </form>

              {/* Mode switch navigation triggers */}
              <div className="mt-6 text-center text-xs text-slate-500">
                {mode === 'login' && (
                  <p>
                    Don't have an account?{' '}
                    <button onClick={() => handleModeChange('register')} className="text-violetAccent hover:text-white font-semibold transition-colors">
                      Register Free
                    </button>
                  </p>
                )}
                {mode === 'register' && (
                  <p>
                    Already have an account?{' '}
                    <button onClick={() => handleModeChange('login')} className="text-violetAccent hover:text-white font-semibold transition-colors">
                      Sign In here
                    </button>
                  </p>
                )}
                {mode === 'forgot' && (
                  <button onClick={() => handleModeChange('login')} className="text-slate-400 hover:text-white flex items-center gap-1 mx-auto font-medium transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Return to Login screen
                  </button>
                )}
              </div>

              {/* Separation divider and OAuth Mock controls (Login & Register modes only) */}
              {mode !== 'forgot' && (
                <div className="mt-6 pt-6 border-t border-slate-800/80">
                  <div className="relative flex py-2 items-center mb-4">
                    <div className="flex-grow border-t border-slate-800/40"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fast Access Sandbox</span>
                    <div className="flex-grow border-t border-slate-800/40"></div>
                  </div>

                  {/* One-click mock OAuth access button */}
                  <button
                    onClick={handleGoogleLoginMock}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 text-sm font-semibold hover:bg-slate-900 transition-colors"
                  >
                    <Chrome className="w-4 h-4 text-rose-500" /> One-Click Google Sandbox Login
                  </button>
                  
                  <p className="mt-3 text-[10px] text-slate-600 text-center leading-normal">
                    💡 Click Sandbox Login to log in instantly as **Sarah Connor** and skip password typing!
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;
