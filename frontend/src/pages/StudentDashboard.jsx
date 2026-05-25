import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { BookOpen, Star, HelpCircle, Bell, ArrowRight, Play, MessageCircle, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom Animated SVG Progress Ring Component
const ProgressRing = ({ radius, stroke, progress }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-95"
      >
        {/* Track circle */}
        <circle
          stroke="rgba(255, 255, 255, 0.05)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Animated fill circle */}
        <motion.circle
          stroke="#10b981" // emeraldAccent
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="shadow-neon-emerald"
          strokeLinecap="round"
        />
      </svg>
      {/* Percentage Center Text */}
      <span className="absolute text-sm font-bold text-white tracking-tighter">{progress}%</span>
    </div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { 
    enrolledCourses, 
    setIsSupportModalOpen, 
    setSupportModalCourseId,
    triggerAlert 
  } = useLMS();
  
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch student dashboard aggregations
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/users/dashboard-student');
      if (res.data?.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve student dashboard analytical statistics.');
    } finally {
      setLoading(false);
    }
  }, [triggerAlert]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard, enrolledCourses]); // Reload when enrolledCourses state changes globally

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigoPrimary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { recentlyAccessed, recommendations, announcements } = dashboardData || {
    recentlyAccessed: [],
    recommendations: [],
    announcements: []
  };

  const handleContactClick = (courseId = '') => {
    setSupportModalCourseId(courseId);
    setIsSupportModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative bg-grid-mesh">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[35%] h-[35%] bg-indigoPrimary/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Greeting Header Banner */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 border-b border-slate-900 pb-8 relative z-10">
        <div className="flex items-center gap-4">
          <img 
            src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`} 
            alt={user.name} 
            className="w-16 h-16 rounded-2xl border border-violetAccent/40 object-cover"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Welcome back, {user.name}!</h1>
            <p className="text-slate-400 text-sm mt-1 font-light">Unravel technical nodes and monitor your academic progress.</p>
          </div>
        </div>

        {/* Global Support Modal button */}
        <button
          onClick={() => handleContactClick()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold tracking-wider transition-all"
        >
          <HelpCircle className="w-4 h-4 text-violetAccent" /> Contact Instructor Support
        </button>
      </section>

      {/* Grid Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Column: Active Enrollments & Recents */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* 1. Enrolled courses grid with animated SVG ProgressRings */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigoPrimary" /> Active Enrolled Courses
            </h2>

            {enrolledCourses.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-850 rounded-3xl bg-slate-900/10">
                <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-base font-bold text-white mb-2">No Active Enrollments</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-xs mx-auto mb-6">Explore our curated catalog and enroll in your first full-stack tech syllabus!</p>
                <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-violetAccent hover:underline">
                  Browse Course Catalog <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {enrolledCourses.map((e) => {
                  if (!e.course) return null;
                  return (
                    <div 
                      key={e._id}
                      className="group glass-panel rounded-3xl p-5 border border-slate-850 hover:border-violetAccent/35 transition-all flex items-center justify-between"
                    >
                      {/* Left info */}
                      <div className="min-w-0 flex-grow pr-4">
                        <span className="text-[10px] text-indigoPrimary font-bold uppercase tracking-wider">{e.course.category}</span>
                        <h3 className="font-bold text-white text-base leading-snug truncate mt-1 mb-2 group-hover:text-indigoPrimary transition-colors">
                          {e.course.title}
                        </h3>
                        
                        <button
                          onClick={() => {
                            const firstId = e.course.lessons && e.course.lessons.length > 0 ? e.course.lessons[0]._id : '';
                            navigate(`/course/${e.course._id}/lessons/${firstId}`);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 text-emeraldAccent fill-current" /> Resume Syllabus
                        </button>
                      </div>

                      {/* Right Animated progress ring */}
                      <div className="flex-shrink-0">
                        <ProgressRing radius={40} stroke={4} progress={e.progress || 0} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Recently studied checklist blocks */}
          {recentlyAccessed.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-violetAccent" /> Recently Studied Lectures
              </h2>
              <div className="space-y-4">
                {recentlyAccessed.map((r, index) => (
                  <div 
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-900 hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={r.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=150&q=80'} 
                        alt="Course Thumbnail" 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">{r.courseTitle}</p>
                        <p className="font-bold text-sm text-slate-200 truncate mt-0.5">{r.lessonTitle}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/course/${r.courseId}/lessons/${r.lessonId}`)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-indigoPrimary hover:text-white text-xs font-semibold text-slate-300 transition-all flex items-center justify-center gap-1.5"
                    >
                      Resume <Play className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Category recommendations catalog */}
          {recommendations.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-2">
                <Star className="w-5 h-5 text-emeraldAccent" /> Tailored Curriculum Recommendations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recommendations.map((course) => (
                  <div 
                    key={course._id}
                    className="glass-panel border border-slate-900 hover:border-violetAccent/30 rounded-2xl p-4 transition-all flex flex-col"
                  >
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full aspect-video rounded-xl object-cover mb-4 border border-slate-900"
                    />
                    <h3 className="font-bold text-slate-200 text-sm leading-snug line-clamp-2 mb-3">{course.title}</h3>
                    
                    <div className="mt-auto pt-3 border-t border-slate-900 flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400">{course.category}</span>
                      <Link 
                        to={`/course/${course._id}`}
                        className="text-xs font-bold text-violetAccent hover:text-white transition-colors flex items-center gap-1"
                      >
                        Syllabus <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Deadlines & announcements bulletin board */}
        <div className="lg:col-span-1 space-y-8">
          {/* Announcements block */}
          <div className="glass-panel rounded-3xl border border-slate-850 p-6 bg-slate-900/25">
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Bell className="w-4 h-4 text-roseAccent fill-current" /> Instructor Bulletin Board
            </h2>

            {announcements.length === 0 ? (
              <p className="text-slate-500 text-xs">No active notices are posted on the board.</p>
            ) : (
              <div className="space-y-6">
                {announcements.map((ann) => (
                  <div 
                    key={ann.id}
                    className="pb-6 border-b border-slate-900/60 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate max-w-[120px]">{ann.courseTitle}</span>
                      <span className="text-[9px] text-slate-600 font-semibold">{ann.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-200 text-sm leading-snug mb-1">{ann.title}</h4>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">{ann.message}</p>
                    
                    <button
                      onClick={() => handleContactClick()}
                      className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-violetAccent hover:text-white transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Submit Reply Inquiry
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timelines Deadlines block */}
          <div className="glass-panel rounded-3xl border border-slate-850 p-6 bg-slate-900/25">
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emeraldAccent" /> Upcoming Academic Milestones
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-indigoPrimary mt-1.5 flex-shrink-0"></div>
                <div>
                  <h4 className="font-bold text-slate-200 text-xs leading-snug">Hook Constraints Project Due</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Syllabus: Framer Motion Masterclass</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-violetAccent mt-1.5 flex-shrink-0"></div>
                <div>
                  <h4 className="font-bold text-slate-200 text-xs leading-snug">Live Lecture Animation physics</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Friday, May 29th | 18:00 UTC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
