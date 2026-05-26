import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LMSProvider, useLMS } from './context/LMSContext';

// Common components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SupportModal from './components/SupportModal';
import Toast from './components/Toast';

// Pages
import Landing from './pages/Landing';
import AuthPages from './pages/AuthPages';
import CourseDetails from './pages/CourseDetails';
import StudentDashboard from './pages/StudentDashboard';
import LessonViewer from './pages/LessonViewer';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Secure Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex flex-col items-center justify-center">
        {/* Gorgeous animated circular loader */}
        <div className="w-16 h-16 border-4 border-violetAccent border-t-transparent rounded-full animate-spin shadow-neon-violet"></div>
        <p className="mt-6 text-slate-400 font-medium tracking-widest text-sm animate-pulse">VERIFYING SESSION STATUS...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized roles back to landing
    return <Navigate to="/" replace />;
  }

  return children;
};

// Outer layout helper to toggle Navbar / Footer based on active screen
const LayoutWrapper = () => {
  const location = useLocation();
  const { globalAlert } = useLMS();

  // Hide nav/footer on fullscreen lesson viewer and auth screens
  const isAuthPage = location.pathname === '/login';
  const isLessonViewer = location.pathname.includes('/lessons/');

  return (
    <div className="flex flex-col min-h-screen bg-darkBg bg-grid-mesh">
      {!isAuthPage && !isLessonViewer && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routing */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthPages />} />
          <Route path="/course/:id" element={<CourseDetails />} />

          {/* Student Protected Routing */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/course/:id/lessons/:lessonId" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <LessonViewer />
              </ProtectedRoute>
            } 
          />

          {/* Instructor Protected Routing */}
          <Route 
            path="/instructor/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Routing */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Global Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && !isLessonViewer && <Footer />}
      <SupportModal />
      {globalAlert && <Toast type={globalAlert.type} message={globalAlert.message} />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LMSProvider>
          <LayoutWrapper />
        </LMSProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
