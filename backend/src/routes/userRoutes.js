const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getStudentDashboard,
  getInstructorDashboard,
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Standard user profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Dashboard stats aggregation routes (Role guarded)
router.get('/dashboard-student', protect, authorize('student', 'admin'), getStudentDashboard);
router.get('/dashboard-instructor', protect, authorize('instructor', 'admin'), getInstructorDashboard);
router.get('/dashboard-admin', protect, authorize('admin'), getAdminDashboard);

// Admin-only user management operations
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/role/:id', protect, authorize('admin'), updateUserRole);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
