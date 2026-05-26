import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import API from '../services/api';
import { ChevronLeft, ChevronRight, PlayCircle, FileText, CheckCircle2, ArrowLeft, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LessonViewer = () => {
  const { id, lessonId } = useParams();
  const navigate = useNavigate();
  const { enrolledCourses, markLessonComplete, triggerAlert } = useLMS();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch complete course syllabus
  const fetchSyllabus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/courses/${id}`);
      if (res.data?.success) {
        setCourse(res.data.course);
      }
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve lesson syllabus.');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, triggerAlert]);

  useEffect(() => {
    fetchSyllabus();
  }, [fetchSyllabus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigoPrimary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course || !course.lessons || course.lessons.length === 0) {
    return (
      <div className="min-h-screen bg-darkBg flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-white mb-2">Lessons Mappings Missing</h2>
        <Link to="/student/dashboard" className="text-indigoPrimary hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  // Find active lesson object
  const activeIndex = course.lessons.findIndex(l => l._id.toString() === lessonId);
  const activeLesson = course.lessons[activeIndex === -1 ? 0 : activeIndex];

  // If lessonId parameter didn't match any index, redirect to the first lesson
  if (activeIndex === -1) {
    navigate(`/course/${course._id}/lessons/${course.lessons[0]._id}`, { replace: true });
    return null;
  }

  // Grab student specific enrollment
  const enrollment = enrolledCourses.find(e => e.course && e.course._id.toString() === course._id.toString());
  const completedLessons = enrollment?.completedLessons || [];
  const isCompleted = completedLessons.includes(activeLesson._id.toString());

  const handleLessonCheckToggle = async () => {
    const res = await markLessonComplete(course._id, activeLesson._id);
    // Dynamic alert messages handles inside LMSContext
  };

  const handleNextLesson = () => {
    if (activeIndex < course.lessons.length - 1) {
      const nextId = course.lessons[activeIndex + 1]._id;
      navigate(`/course/${course._id}/lessons/${nextId}`);
    }
  };

  const handlePrevLesson = () => {
    if (activeIndex > 0) {
      const prevId = course.lessons[activeIndex - 1]._id;
      navigate(`/course/${course._id}/lessons/${prevId}`);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex relative overflow-hidden">
      {/* Mobile drawer toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden absolute bottom-5 right-5 z-50 p-3.5 rounded-full bg-indigoPrimary text-white shadow-xl focus:outline-none"
        aria-label="Toggle syllabus list drawer"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Left Column Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="flex-shrink-0 bg-slate-950 border-r border-slate-900 flex flex-col z-30 h-screen sticky top-0"
          >
            {/* Upper title */}
            <div className="p-5 border-b border-slate-900 flex items-center justify-between">
              <Link 
                to="/student/dashboard" 
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 uppercase tracking-wider transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> My Learning Dashboard
              </Link>
            </div>

            <div className="p-5 border-b border-slate-900 bg-slate-950/20">
              <h1 className="text-sm font-black text-white line-clamp-2 leading-tight">{course.title}</h1>
              {enrollment && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-grow bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emeraldAccent h-full transition-all duration-500 shadow-neon-emerald" 
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{enrollment.progress}%</span>
                </div>
              )}
            </div>

            {/* Checklist index list of lessons */}
            <div className="flex-grow overflow-y-auto p-4 space-y-2">
              {course.lessons.map((lesson, idx) => {
                const lessonComplete = completedLessons.includes(lesson._id.toString());
                const lessonActive = lesson._id.toString() === activeLesson._id.toString();

                return (
                  <button
                    key={lesson._id}
                    onClick={() => navigate(`/course/${course._id}/lessons/${lesson._id}`)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      lessonActive
                        ? 'bg-indigoPrimary/10 border-indigoPrimary/30 text-white font-semibold'
                        : 'bg-transparent border-transparent text-slate-450 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Status checkmark */}
                    <div className="flex-shrink-0">
                      {lessonComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-emeraldAccent fill-emeraldAccent/10" />
                      ) : lesson.type === 'video' ? (
                        <PlayCircle className="w-5 h-5 text-slate-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-500" />
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <p className="text-xs text-slate-500 leading-none mb-1 font-semibold uppercase tracking-wider">Module {idx + 1}</p>
                      <p className="text-sm leading-snug font-medium truncate text-slate-200">{lesson.title}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Right Column Content Viewer */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Upper active lesson details */}
        <header className="flex-shrink-0 h-16 border-b border-slate-900/80 px-6 flex items-center justify-between bg-slate-950/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {activeLesson.type}
            </span>
            <h2 className="text-base font-bold text-white truncate max-w-md sm:max-w-xl leading-none">
              {activeLesson.title}
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 pr-12 lg:pr-0">Duration: {activeLesson.duration}</span>
        </header>

        {/* Content Viewer viewport */}
        <div className="flex-grow overflow-y-auto p-6 sm:p-8 bg-slate-950/30">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {activeLesson.type === 'video' ? (
              <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative">
                {/* Responsive HTML5 Player utilizing pre-seeded BBB video url or fallback */}
                <video
                  key={activeLesson._id}
                  src={activeLesson.content}
                  controls
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80"
                />
              </div>
            ) : (
              <div className="flex-grow glass-panel rounded-3xl border border-slate-850 p-8 sm:p-10 shadow-xl overflow-y-auto bg-slate-900/20">
                <h3 className="text-2xl font-black text-white tracking-tight mb-6">Technical Blueprints</h3>
                <div className="text-slate-300 leading-relaxed font-light text-base space-y-6">
                  {activeLesson.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  <div className="highlight-card bg-slate-950/40 border-l-4 border-violetAccent p-6 rounded-r-2xl mt-8">
                    <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">Module Study Assignment</h4>
                    <p className="text-sm text-slate-400">
                      Study these blueprints thoroughly and review their structural implications. Ensure you can replicate the components described before marking this module complete!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation bottom control bar */}
        <footer className="flex-shrink-0 h-20 border-t border-slate-900/80 px-6 bg-slate-950/20 backdrop-blur-md flex items-center justify-between">
          {/* Previous module button */}
          <button
            onClick={handlePrevLesson}
            disabled={activeIndex === 0}
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Module
          </button>

          {/* Mark Complete center trigger */}
          <button
            onClick={handleLessonCheckToggle}
            className={`flex items-center gap-2 py-3 px-8 rounded-2xl text-sm font-semibold transition-all ${
              isCompleted
                ? 'bg-emeraldAccent/10 border border-emeraldAccent/40 text-emeraldAccent hover:bg-emeraldAccent/20'
                : 'bg-indigoPrimary text-white hover:bg-violetAccent hover:shadow-neon-violet'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'fill-emeraldAccent/10' : ''}`} />
            {isCompleted ? 'Completed' : 'Mark as Complete'}
          </button>

          {/* Next module button */}
          <button
            onClick={handleNextLesson}
            disabled={activeIndex === course.lessons.length - 1}
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Next Module <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </main>
    </div>
  );
};

export default LessonViewer;
