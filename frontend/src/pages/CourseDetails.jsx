import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { BookOpen, Star, Play, CheckCircle2, ChevronDown, Award, Globe, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { enrolledCourses, enrollInCourse, triggerAlert } = useLMS();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState(null);
  
  // Enrollment confirmation state
  const [isConfirming, setIsConfirming] = useState(false);
  const [enrollingLoading, setEnrollingLoading] = useState(false);

  // Fetch course details
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/courses/${id}`);
      if (res.data?.success) {
        setCourse(res.data.course);
      }
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve course details.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, triggerAlert]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigoPrimary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-darkBg flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-white mb-2">Course Not Found</h2>
        <Link to="/" className="text-sm text-indigoPrimary hover:underline">Return to exploration</Link>
      </div>
    );
  }

  // Check if student is already enrolled in this course
  const enrollment = enrolledCourses.find(e => e.course && e.course._id.toString() === course._id.toString());
  const isEnrolled = !!enrollment;

  const handleEnrollmentSubmit = async () => {
    if (!user) {
      triggerAlert('warning', 'Please sign in or create an account to enroll in courses.');
      navigate('/login');
      return;
    }
    
    if (user.role === 'instructor') {
      triggerAlert('error', 'Instructors cannot enroll in curriculums.');
      return;
    }

    setEnrollingLoading(true);
    const result = await enrollInCourse(course._id);
    setEnrollingLoading(false);
    
    if (result.success) {
      setIsConfirming(false);
      // Route student directly to the first lesson
      if (course.lessons && course.lessons.length > 0) {
        navigate(`/course/${course._id}/lessons/${course.lessons[0]._id}`);
      } else {
        navigate('/student/dashboard');
      }
    }
  };

  return (
    <div className="relative pb-24 bg-grid-mesh">
      {/* Visual glowing points */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigoPrimary/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Hero Banner Grid Header */}
      <section className="bg-slate-950/60 border-b border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Title / details */}
            <div className="lg:col-span-2">
              <span className="px-3 py-1.5 rounded-full bg-indigoPrimary/10 border border-indigoPrimary/20 text-xs font-semibold text-indigoPrimary">
                {course.category}
              </span>
              
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4 mb-6 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-slate-400 text-lg font-light leading-relaxed mb-8">
                {course.subtitle || course.description}
              </p>

              {/* Review / statistics items */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-2">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-amber-500 fill-current" />
                  <span className="font-bold text-white text-base">{course.rating || 4.8}</span>
                  <span className="text-slate-500">(156 verified reviews)</span>
                </div>
                
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-violetAccent" />
                  <span>{course.lessons?.length || 0} Modules</span>
                </div>

                <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>

                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emeraldAccent" />
                  <span>Fully Online Self-Paced</span>
                </div>
              </div>
            </div>

            {/* Float Enrollment card widget */}
            <div className="lg:col-span-1">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden bg-slate-900/40">
                <img 
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'} 
                  alt={course.title} 
                  className="w-full aspect-video rounded-2xl object-cover mb-6 border border-slate-800"
                />

                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Tuition Fee</span>
                  <span className="text-3xl font-black text-white">
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </span>
                </div>

                {isEnrolled ? (
                  <button
                    onClick={() => {
                      const firstLessonId = course.lessons && course.lessons.length > 0 ? course.lessons[0]._id : '';
                      navigate(`/course/${course._id}/lessons/${firstLessonId}`);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-indigoPrimary to-violetAccent text-white font-semibold text-sm hover:shadow-neon-violet hover:scale-[1.01] transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" /> Resume Course Syllabus
                  </button>
                ) : (
                  <button
                    onClick={() => setIsConfirming(true)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigoPrimary to-violetAccent text-white font-semibold text-sm hover:shadow-neon-violet hover:scale-[1.01] transition-all"
                  >
                    Enroll in Syllabus
                  </button>
                )}

                <p className="mt-4 text-[10px] text-slate-500 text-center uppercase tracking-widest font-semibold leading-relaxed">
                  🔒 30-Day Tuition Security Guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content Area: Syllabus & Instructor Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Syllabus accordions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-white tracking-tight mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-violetAccent" /> Course Curriculum Outline
            </h2>

            {/* syllabus list */}
            {course.lessons && course.lessons.length > 0 ? (
              <div className="space-y-3">
                {course.lessons.map((lesson, index) => {
                  const isExpanded = activeAccordion === index;
                  return (
                    <div 
                      key={lesson._id}
                      className="glass-panel border border-slate-900 rounded-2xl overflow-hidden"
                    >
                      <button
                        onClick={() => setActiveAccordion(isExpanded ? null : index)}
                        className="w-full flex items-center justify-between p-5 text-left text-slate-200 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-sm sm:text-base leading-tight">{lesson.title}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-violetAccent' : ''}`} />
                      </button>

                      {/* Expanding Framer Motion container */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-slate-900/60 bg-slate-900/10"
                          >
                            <div className="p-5 text-sm text-slate-400 font-light leading-relaxed space-y-4">
                              <p>
                                {lesson.type === 'video' 
                                  ? 'This is a high-fidelity video lecture introducing major theoretical properties and live architectural demonstrations of the subject.' 
                                  : 'This module is a detailed documentation blueprint designed to be downloaded and studied offline to acquire core formulas.'}
                              </p>
                              <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
                                <span>Format: <strong className="text-slate-400 uppercase">{lesson.type}</strong></span>
                                <span>Duration: <strong className="text-slate-400">{lesson.duration}</strong></span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-850 rounded-2xl">
                <p className="text-sm text-slate-500">The syllabus modules for this course are currently being mapped by faculty.</p>
              </div>
            )}
          </div>

          {/* Right: Instructor profile & testimonials */}
          <div className="lg:col-span-1 space-y-8">
            {/* Instructor Box */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-850 bg-slate-900/20">
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Meet Your Instructor</h3>
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={course.instructor?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${course.instructor?.name || 'ev'}`} 
                  alt={course.instructor?.name} 
                  className="w-12 h-12 rounded-full border border-violetAccent/40 object-cover"
                />
                <div>
                  <h4 className="font-bold text-white text-base leading-none mb-1">{course.instructor?.name || 'Dr. Evelyn Martinez'}</h4>
                  <p className="text-xs text-slate-500 font-medium">Senior Tech Faculty Staff</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm font-light leading-relaxed">
                Evelyn is a tech researcher specializing in React structures, Framer curves, and complex Node cluster designs. She has taught over 10,000 students globally and leads the LMS core curriculum advisory committee.
              </p>
            </div>

            {/* Course Features badge */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-850 bg-slate-900/20">
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Learning Guarantees</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-indigoPrimary flex-shrink-0" />
                  <span>Interactive course graduation diploma certificate</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageSquare className="w-5 h-5 text-violetAccent flex-shrink-0" />
                  <span>Direct instructor messaging support channel</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-emeraldAccent flex-shrink-0" />
                  <span>Production-grade GitHub code audits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirming && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirming(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm glass-panel rounded-3xl border border-slate-800 shadow-2xl p-6 text-center z-10"
            >
              <CheckCircle2 className="w-12 h-12 text-emeraldAccent mx-auto mb-4 animate-pulse shadow-neon-emerald/20" />
              
              <h3 className="text-xl font-bold text-white mb-2">Confirm Enrollment</h3>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-light">
                Are you ready to unlock the course <strong>"{course.title}"</strong>? You will get instant access to all lectures, templates, and certificates.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnrollmentSubmit}
                  disabled={enrollingLoading}
                  className="py-2.5 rounded-xl bg-indigoPrimary text-white hover:bg-violetAccent hover:shadow-neon-violet text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {enrollingLoading ? 'Enrolling...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetails;
