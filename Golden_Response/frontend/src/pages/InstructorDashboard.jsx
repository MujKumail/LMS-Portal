import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import API from '../services/api';
import { BookOpen, Users, Star, DollarSign, Plus, ArrowUp, ArrowDown, Send, Trash, Edit, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const { triggerAlert } = useLMS();

  const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0, avgRating: '5.0', totalEarnings: 0 });
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states: course creator
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Web Development');
  const [newPrice, setNewPrice] = useState('49.99');
  const [creatorLoading, setCreatorLoading] = useState(false);

  // Form states: broadcasting announcement
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceBody, setAnnounceBody] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  // Interactive Reordering state
  const [activeCourseId, setActiveCourseId] = useState('');
  const [activeLessons, setActiveLessons] = useState([]);
  const [reorderingLoading, setReorderingLoading] = useState(false);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/users/dashboard-instructor');
      if (res.data?.success) {
        setStats(res.data.stats);
        setCourseStats(res.data.courseStats);
        
        // Auto-select first course for ordering list
        if (res.data.courseStats.length > 0 && !activeCourseId) {
          const firstId = res.data.courseStats[0]._id;
          setActiveCourseId(firstId);
          setSelectedCourseId(firstId);
          fetchLessonsForCourse(firstId);
        }
      }
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve instructor analytics.');
    } finally {
      setLoading(false);
    }
  }, [activeCourseId, triggerAlert]);

  const fetchLessonsForCourse = async (courseId) => {
    try {
      const res = await API.get(`/courses/${courseId}`);
      if (res.data?.success) {
        // Sort course lessons by current order
        const lessons = res.data.course.lessons || [];
        lessons.sort((a, b) => a.order - b.order);
        setActiveLessons(lessons);
      }
    } catch (err) {
      console.error('Failed to query course lessons:', err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleCourseCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      triggerAlert('error', 'Please provide course title and description.');
      return;
    }

    setCreatorLoading(true);
    try {
      const res = await API.post('/courses', {
        title: newTitle,
        subtitle: newSubtitle,
        description: newDesc,
        category: newCategory,
        price: newPrice
      });
      
      if (res.data?.success) {
        triggerAlert('success', res.data.message);
        setIsCreatorOpen(false);
        setNewTitle('');
        setNewSubtitle('');
        setNewDesc('');
        fetchDashboardStats();
      }
    } catch (err) {
      triggerAlert('error', err.response?.data?.error || 'Failed to create course.');
    } finally {
      setCreatorLoading(false);
    }
  };

  const handleBroadcastAnnouncement = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      triggerAlert('error', 'Please select a course to broadcast.');
      return;
    }
    if (!announceTitle.trim() || !announceBody.trim()) {
      triggerAlert('error', 'Please fill announcement title and description.');
      return;
    }

    setBroadcastLoading(true);
    try {
      const res = await API.post(`/courses/${selectedCourseId}/announcement`, {
        title: announceTitle,
        message: announceBody
      });
      if (res.data?.success) {
        triggerAlert('success', res.data.message);
        setAnnounceTitle('');
        setAnnounceBody('');
      }
    } catch (err) {
      triggerAlert('error', err.response?.data?.error || 'Failed to broadcast update.');
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Reorder lessons
  const moveLesson = (index, direction) => {
    const updated = [...activeLessons];
    if (direction === 'up' && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === 'down' && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    setActiveLessons(updated);
  };

  const saveLessonOrder = async () => {
    if (!activeCourseId) return;
    setReorderingLoading(true);
    try {
      const orderedIds = activeLessons.map(l => l._id);
      const res = await API.put(`/courses/${activeCourseId}/lessons-order`, { orderedIds });
      if (res.data?.success) {
        triggerAlert('success', res.data.message);
        fetchLessonsForCourse(activeCourseId);
      }
    } catch (err) {
      triggerAlert('error', 'Failed to synchronize lesson order.');
    } finally {
      setReorderingLoading(false);
    }
  };

  const handleCourseSelectChange = (courseId) => {
    setActiveCourseId(courseId);
    fetchLessonsForCourse(courseId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigoPrimary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative bg-grid-mesh">
      {/* Visual glowing points */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-violetAccent/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Greeting Banner */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 border-b border-slate-900 pb-8 z-10 relative">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Instructor Center</h1>
          <p className="text-slate-400 text-sm mt-1 font-light">Monitor student enrollments, design curriculums, and manage modules.</p>
        </div>
        <button
          onClick={() => setIsCreatorOpen(true)}
          className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-indigoPrimary hover:bg-violetAccent text-white font-semibold text-xs tracking-wider hover:shadow-neon-violet transition-all"
        >
          <Plus className="w-4 h-4" /> Create Course Syllabus
        </button>
      </section>

      {/* Dashboard Analytics Widgets */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 z-10 relative">
        {/* Total Courses */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850 bg-slate-900/10 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigoPrimary/10 text-indigoPrimary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Syllabi</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.totalCourses}</h3>
          </div>
        </div>

        {/* Student enrollments */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850 bg-slate-900/10 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-violetAccent/10 text-violetAccent">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Students</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.totalStudents}</h3>
          </div>
        </div>

        {/* Rating average */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850 bg-slate-900/10 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emeraldAccent/10 text-emeraldAccent">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Rating</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.avgRating}</h3>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850 bg-slate-900/10 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projected Tuition</p>
            <h3 className="text-2xl font-bold text-white mt-1">${stats.totalEarnings.toFixed(2)}</h3>
          </div>
        </div>
      </section>

      {/* Main grids: left curriculum list, right reordering & broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 z-10 relative">
        {/* Left column: Courses syllabus list */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigoPrimary" /> Managed Curriculums
            </h2>

            {courseStats.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-850 rounded-3xl bg-slate-900/10">
                <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-base font-bold text-white mb-2">No Active Curriculums</h3>
                <p className="text-slate-500 text-sm mb-4">You haven't designed any courses yet. Get started and share your knowledge!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courseStats.map((course) => (
                  <div 
                    key={course._id}
                    onClick={() => handleCourseSelectChange(course._id)}
                    className={`glass-panel border p-5 rounded-3xl cursor-pointer hover:border-violetAccent/40 flex items-center justify-between transition-all ${
                      activeCourseId === course._id ? 'border-indigoPrimary bg-slate-900/30' : 'border-slate-850'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base leading-snug">{course.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          course.status === 'approved' ? 'bg-emeraldAccent/10 text-emeraldAccent border border-emeraldAccent/20' :
                          course.status === 'pending' ? 'bg-amber-500/10 text-amber-550 border border-amber-550/20' :
                          'bg-roseAccent/10 text-roseAccent border border-roseAccent/20'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-2">
                        <span>Price: <strong className="text-slate-300">${course.price.toFixed(2)}</strong></span>
                        <span>Students Enrolled: <strong className="text-slate-300">{course.enrollmentCount}</strong></span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/course/${course._id}`); }}
                        className="text-xs font-bold text-violetAccent hover:text-white transition-colors"
                      >
                        Public Syllabus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Broadcast Announcement Board */}
          <div className="glass-panel rounded-3xl border border-slate-850 p-6 bg-slate-900/25">
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Send className="w-4 h-4 text-violetAccent" /> Broadcast Announcement Bulletin
            </h2>
            <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
              <div>
                <label htmlFor="broadcast-course" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Select Syllabus Target</label>
                <select
                  id="broadcast-course"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigoPrimary rounded-xl py-2.5 px-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigoPrimary"
                >
                  <option value="">Choose Course...</option>
                  {courseStats.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="broadcast-title" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Notice Header</label>
                <input
                  id="broadcast-title"
                  type="text"
                  placeholder="E.g. Final Project Guidelines updated"
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigoPrimary rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="broadcast-body" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Bulletin Message</label>
                <textarea
                  id="broadcast-body"
                  placeholder="Type your announcements to dispatch email notifications immediately..."
                  value={announceBody}
                  onChange={(e) => setAnnounceBody(e.target.value)}
                  rows="3"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigoPrimary rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={broadcastLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigoPrimary to-violetAccent text-white text-xs font-semibold hover:shadow-neon-violet transition-all disabled:opacity-50"
              >
                {broadcastLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Broadcast Notice Alert
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Interactive drag-and-drop simulated lesson ordering */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-3xl border border-slate-850 p-6 bg-slate-900/25 flex flex-col h-full">
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emeraldAccent" /> Syllabus Lesson Indexer
            </h2>

            {activeLessons.length === 0 ? (
              <p className="text-slate-500 text-xs my-auto text-center">Please select a course to reorder or add syllabus lessons.</p>
            ) : (
              <div className="flex-grow flex flex-col justify-between">
                <p className="text-xs text-slate-400 font-light mb-4">Re-order course lessons. Move items using up/down toggles and sync indexers.</p>
                <div className="space-y-2 mb-6">
                  {activeLessons.map((lesson, index) => (
                    <div 
                      key={lesson._id}
                      className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between text-left"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[9px] text-slate-500 font-semibold block leading-none mb-1">Lesson {index + 1}</span>
                        <p className="font-bold text-xs text-slate-200 truncate">{lesson.title}</p>
                      </div>
                      
                      {/* Arrow adjust ordering controllers */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => moveLesson(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-all focus:outline-none"
                          aria-label="Move lesson up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLesson(index, 'down')}
                          disabled={index === activeLessons.length - 1}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-all focus:outline-none"
                          aria-label="Move lesson down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={saveLessonOrder}
                  disabled={reorderingLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-emeraldAccent hover:text-white hover:bg-emeraldAccent text-xs font-bold transition-all disabled:opacity-50"
                >
                  {reorderingLoading ? (
                    <div className="w-4 h-4 border-2 border-emeraldAccent border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> Save Reordered Index
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer: Course Creator modal dialog */}
      <AnimatePresence>
        {isCreatorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatorOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md glass-panel rounded-3xl border border-slate-800 shadow-2xl p-6 z-10"
            >
              <h3 className="text-xl font-bold text-white mb-4">Syllabus Outline Builder</h3>
              
              <form onSubmit={handleCourseCreate} className="space-y-4 text-left">
                <div>
                  <label htmlFor="create-title" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Course Title</label>
                  <input
                    id="create-title"
                    type="text"
                    placeholder="E.g. Framer Motion Masterclass"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigoPrimary rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="create-subtitle" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Subtitle / Catchphrase</label>
                  <input
                    id="create-subtitle"
                    type="text"
                    placeholder="E.g. Master dynamic spring-based micro-animations"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigoPrimary rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="create-desc" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Syllabus Description</label>
                  <textarea
                    id="create-desc"
                    placeholder="Provide details on curriculum scope, targets, and projects..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows="3"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigoPrimary rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="create-category" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      id="create-category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Design & UI/UX">Design & UI/UX</option>
                      <option value="Backend Engineering">Backend Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="create-price" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tuition price ($)</label>
                    <input
                      id="create-price"
                      type="number"
                      step="0.01"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigoPrimary rounded-xl py-2 px-4 text-xs text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreatorOpen(false)}
                    className="py-2.5 rounded-xl border border-slate-805 text-slate-400 hover:text-white text-xs font-semibold hover:bg-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatorLoading}
                    className="py-2.5 rounded-xl bg-indigoPrimary text-white hover:bg-violetAccent hover:shadow-neon-violet text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {creatorLoading ? 'Submitting...' : 'Submit Syllabus'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstructorDashboard;
