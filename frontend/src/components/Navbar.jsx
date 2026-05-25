import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, User, Layout, Menu, X, HelpCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigoPrimary to-violetAccent text-white shadow-neon-indigo group-hover:scale-105 transition-transform duration-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigoPrimary bg-clip-text text-transparent group-hover:opacity-95 transition-opacity">
                LMS<span className="text-violetAccent">Academy</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Link Tabs */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-violetAccent' : 'text-slate-300 hover:text-white'}`}
            >
              Explore Courses
            </Link>

            {user && (
              <>
                {(user.role === 'student' || user.role === 'admin') && (
                  <Link 
                    to="/student/dashboard" 
                    className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/student/dashboard') ? 'text-violetAccent' : 'text-slate-300 hover:text-white'}`}
                  >
                    <Layout className="w-4 h-4" /> My Learning
                  </Link>
                )}
                {(user.role === 'instructor' || user.role === 'admin') && (
                  <Link 
                    to="/instructor/dashboard" 
                    className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/instructor/dashboard') ? 'text-violetAccent' : 'text-slate-300 hover:text-white'}`}
                  >
                    <BookOpen className="w-4 h-4" /> Instructor Board
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link 
                    to="/admin/dashboard" 
                    className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/admin/dashboard') ? 'text-violetAccent' : 'text-slate-300 hover:text-white'}`}
                  >
                    <ShieldAlert className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Profile CTA / Action Controls */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-800 transition-colors focus:outline-none"
                  aria-expanded={isProfileOpen}
                >
                  <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full border border-violetAccent/40 object-cover"
                  />
                  <span className="text-sm font-medium text-slate-200">{user.name.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-xl py-2 border border-slate-800"
                    >
                      <div className="px-4 py-3 border-b border-slate-800/60">
                        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{user.role}</p>
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <button 
                          onClick={() => { setIsProfileOpen(false); navigate(user.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'); }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                        >
                          <User className="w-4 h-4" /> My Profile
                        </button>
                      </div>

                      <div className="border-t border-slate-800/60 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-roseAccent hover:bg-roseAccent/10 transition-colors text-left font-medium"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                to="/login"
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-semibold rounded-xl group bg-gradient-to-br from-indigoPrimary to-violetAccent text-white focus:ring-4 focus:outline-none focus:ring-indigo-800 mt-2"
              >
                <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-darkBg rounded-lg group-hover:bg-opacity-0">
                  Join / Login
                </span>
              </Link>
            )}
          </div>

          {/* Mobile responsive toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800/80 bg-darkBg/95 backdrop-blur-lg"
          >
            <div className="px-2 pt-2 pb-4 space-y-1">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                Explore Courses
              </Link>
              
              {user && (
                <>
                  {(user.role === 'student' || user.role === 'admin') && (
                    <Link
                      to="/student/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/student/dashboard') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      My Dashboard
                    </Link>
                  )}
                  {(user.role === 'instructor' || user.role === 'admin') && (
                    <Link
                      to="/instructor/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/instructor/dashboard') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      Instructor Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/admin/dashboard') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <div className="pt-4 border-t border-slate-800 mt-4 px-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full border border-violetAccent/30"
                      />
                      <div>
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-roseAccent hover:bg-roseAccent/10 rounded-xl transition-colors"
                      aria-label="Sign out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center mt-4 mx-3 py-2.5 rounded-xl text-base font-semibold bg-gradient-to-r from-indigoPrimary to-violetAccent text-white shadow-neon-indigo"
                >
                  Join LMS Academy
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
