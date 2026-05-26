import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import API from '../services/api';
import { Users, GraduationCap, BookOpen, ShieldAlert, Award, TrendingUp, Check, X, Shield, Trash2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { triggerAlert } = useLMS();

  const [stats, setStats] = useState({ studentCount: 0, instructorCount: 0, totalCourses: 0, totalEnrollments: 0 });
  const [pendingCourses, setPendingCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/users/dashboard-admin');
      if (res.data?.success) {
        setStats(res.data.stats);
        setPendingCourses(res.data.pendingCourses);
        setStudents(res.data.students);
        setInstructors(res.data.instructors);
        setTrends(res.data.enrollmentTrends || []);
      }
    } catch (err) {
      triggerAlert('error', 'Failed to load administrative analytics.');
    } finally {
      setLoading(false);
    }
  }, [triggerAlert]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // 1. APPROVE / REJECT COURSE
  const handleCourseApproval = async (courseId, status) => {
    try {
      const res = await API.put(`/courses/${courseId}/status`, { status });
      if (res.data?.success) {
        triggerAlert('success', res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      triggerAlert('error', 'Failed to update course status.');
    }
  };

  // 2. TOGGLE USER ROLE
  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'student' ? 'instructor' : 'student';
    try {
      const res = await API.put(`/users/role/${userId}`, { role: nextRole });
      if (res.data?.success) {
        triggerAlert('success', res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      triggerAlert('error', 'Failed to update user role.');
    }
  };

  // 3. DELETE USER
  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? All corresponding enrollments or courses will be pruned recursively.')) {
      return;
    }
    try {
      const res = await API.delete(`/users/${userId}`);
      if (res.data?.success) {
        triggerAlert('success', res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      triggerAlert('error', 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigoPrimary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate highest trend count for SVG charting scaling
  const maxTrendVal = trends.length > 0 ? Math.max(...trends.map(t => t.enrollments)) : 10;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative bg-grid-mesh">
      {/* Decorative Blur Glows */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigoPrimary/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header Greeting */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 border-b border-slate-900 pb-8 z-10 relative">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Administrative Suite</h1>
          <p className="text-slate-400 text-sm mt-1 font-light">Complete system oversight, curriculum reviews, role adjustments, and platform analytics.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-900">
          <ShieldAlert className="w-4 h-4 text-roseAccent animate-pulse" /> Secure Core Node
        </div>
      </section>

      {/* Analytics Card Widgets */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 z-10 relative">
        {/* Total Students */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850 bg-slate-900/10 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigoPrimary/10 text-indigoPrimary">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Learners</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.studentCount}</h3>
          </div>
        </div>

        {/* Total Instructors */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850 bg-slate-900/10 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-violetAccent/10 text-violetAccent">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Academics</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.instructorCount}</h3>
          </div>
        </div>

        {/* Total Courses */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850 bg-slate-900/10 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emeraldAccent/10 text-emeraldAccent">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Syllabi</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.totalCourses}</h3>
          </div>
        </div>

        {/* Total Enrollments */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850 bg-slate-900/10 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Enrollments</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.totalEnrollments}</h3>
          </div>
        </div>
      </section>

      {/* Trends Graph & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 z-10 relative">
        
        {/* 1. Visual trend graph utilizing native animated SVG */}
        <div className="lg:col-span-2 glass-panel rounded-3xl border border-slate-850 p-6 bg-slate-900/25 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emeraldAccent" /> Enrollment Growth Metrics
            </h2>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Last 5 Months</span>
          </div>

          <div className="w-full h-48 bg-slate-950/60 rounded-2xl border border-slate-900/40 p-4 flex items-end justify-between relative overflow-hidden">
            {trends.map((t, idx) => {
              const heightPct = (t.enrollments / maxTrendVal) * 100;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-grow h-full justify-end relative z-10">
                  <span className="text-[10px] font-bold text-slate-400">{t.enrollments}</span>
                  {/* Bar fill with slide animation */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct * 0.7}%` }}
                    transition={{ duration: 1.2, delay: idx * 0.1, ease: 'easeOut' }}
                    className="w-8 sm:w-12 rounded-t-lg bg-gradient-to-t from-indigoPrimary to-violetAccent shadow-neon-indigo"
                  />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Course Approval Board */}
        <div className="lg:col-span-1 glass-panel rounded-3xl border border-slate-850 p-6 bg-slate-900/25 flex flex-col h-full">
          <h2 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-roseAccent fill-current" /> Curriculum Review Board
          </h2>

          {pendingCourses.length === 0 ? (
            <div className="my-auto text-center py-10">
              <Check className="w-10 h-10 text-emeraldAccent mx-auto mb-3 shadow-neon-emerald/20 bg-emeraldAccent/10 rounded-full p-2" />
              <h4 className="font-bold text-slate-200 text-sm">Catalog Cleared</h4>
              <p className="text-slate-500 text-xs mt-1">All submitted course syllabi have been approved.</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto flex-grow max-h-48 pr-1">
              {pendingCourses.map(course => (
                <div 
                  key={course._id}
                  className="p-3 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-200 truncate">{course.title}</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Author: {course.instructor?.name || 'Staff'}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleCourseApproval(course._id, 'approved')}
                      className="p-1.5 rounded-lg bg-emeraldAccent/10 border border-emeraldAccent/30 text-emeraldAccent hover:bg-emeraldAccent hover:text-white transition-all"
                      aria-label="Approve course"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCourseApproval(course._id, 'rejected')}
                      className="p-1.5 rounded-lg bg-roseAccent/10 border border-roseAccent/30 text-roseAccent hover:bg-roseAccent hover:text-white transition-all"
                      aria-label="Reject course"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Management Table */}
      <section className="glass-panel border border-slate-850 rounded-3xl p-6 bg-slate-900/10 z-10 relative">
        <h2 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigoPrimary" /> Platform User Directory
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Account Type</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...instructors, ...students].map((u) => (
                <tr key={u._id} className="border-b border-slate-900/60 last:border-b-0 hover:bg-slate-950/20 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={u.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.name}`} 
                        alt={u.name} 
                        className="w-7 h-7 rounded-lg border border-slate-800 object-cover"
                      />
                      <span className="font-bold text-slate-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-400 font-light">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-roseAccent/10 text-roseAccent' :
                      u.role === 'instructor' ? 'bg-violetAccent/10 text-violetAccent' :
                      'bg-indigoPrimary/10 text-indigoPrimary'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-3">
                      {/* Toggle Role */}
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        className="text-[10px] font-bold text-indigoPrimary hover:text-white transition-colors"
                      >
                        Change to {u.role === 'student' ? 'Instructor' : 'Student'}
                      </button>
                      
                      {/* Delete */}
                      <button
                        onClick={() => handleUserDelete(u._id)}
                        className="text-slate-500 hover:text-roseAccent p-1 transition-colors"
                        aria-label="Delete user account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
