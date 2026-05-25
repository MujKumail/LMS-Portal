import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const LMSContext = createContext(null);

export const LMSProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  
  // UI States
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportModalCourseId, setSupportModalCourseId] = useState('');
  const [globalAlert, setGlobalAlert] = useState(null);

  // Set transient toast notifications
  const triggerAlert = useCallback((type, message) => {
    setGlobalAlert({ type, message });
    setTimeout(() => {
      setGlobalAlert(null);
    }, 4000);
  }, []);

  // 1. FETCH COURSE CATALOG (supports debounced searches, categories)
  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchKeyword) params.search = searchKeyword;

      // Allow instructors/admins to see all courses they own or are pending
      if (user && (user.role === 'instructor' || user.role === 'admin')) {
        params.status = 'all'; 
      }

      const res = await API.get('/courses', { params });
      if (res.data?.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error('Failed to load courses catalog:', err);
    } finally {
      setLoadingCourses(false);
    }
  }, [selectedCategory, searchKeyword, user]);

  // 2. FETCH ENROLLED COURSES
  const fetchEnrolledCourses = useCallback(async () => {
    if (!user || user.role !== 'student') return;
    setLoadingEnrolled(true);
    try {
      const res = await API.get('/progress/my-courses');
      if (res.data?.success) {
        setEnrolledCourses(res.data.enrollments);
      }
    } catch (err) {
      console.error('Failed to load enrolled courses:', err);
    } finally {
      setLoadingEnrolled(false);
    }
  }, [user]);

  // Load catalog on change
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Load enrolled courses on login
  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  // 3. ENROLL IN COURSE
  const enrollInCourse = async (courseId) => {
    try {
      const res = await API.post(`/progress/enroll/${courseId}`);
      if (res.data?.success) {
        triggerAlert('success', res.data.message);
        fetchEnrolledCourses();
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Enrollment transaction failed.';
      triggerAlert('error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // 4. MARK LESSON AS COMPLETE
  const markLessonComplete = async (courseId, lessonId) => {
    try {
      const res = await API.post(`/progress/complete-lesson/${courseId}/${lessonId}`);
      if (res.data?.success) {
        triggerAlert('success', res.data.message);
        // Refresh enrolled details
        fetchEnrolledCourses();
        return { 
          success: true, 
          progress: res.data.progress, 
          completedLessons: res.data.completedLessons,
          completedAt: res.data.completedAt 
        };
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update lesson progress.';
      triggerAlert('error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // 5. SUBMIT SUPPORT TICKET
  const submitSupportTicket = async (name, email, subject, message) => {
    try {
      const res = await API.post('/contact/submit', { name, email, subject, message });
      if (res.data?.success) {
        triggerAlert('success', res.data.message);
        setIsSupportModalOpen(false);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to submit help ticket.';
      triggerAlert('error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  return (
    <LMSContext.Provider value={{
      courses,
      enrolledCourses,
      searchKeyword,
      setSearchKeyword,
      selectedCategory,
      setSelectedCategory,
      loadingCourses,
      loadingEnrolled,
      
      // UI
      isSupportModalOpen,
      setIsSupportModalOpen,
      supportModalCourseId,
      setSupportModalCourseId,
      globalAlert,
      triggerAlert,
      
      // Actions
      fetchCourses,
      fetchEnrolledCourses,
      enrollInCourse,
      markLessonComplete,
      submitSupportTicket
    }}>
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = () => useContext(LMSContext);
