const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  broadcastAnnouncement,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  updateCourseStatus
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public course viewing routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Protected courses manipulation (restricted to instructors and admins)
router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

// Course announcement broadcast
router.post('/:id/announcement', protect, authorize('instructor', 'admin'), broadcastAnnouncement);

// Lesson syllabus management
router.post('/:id/lessons', protect, authorize('instructor', 'admin'), addLesson);
router.put('/:id/lessons/:lessonId', protect, authorize('instructor', 'admin'), updateLesson);
router.delete('/:id/lessons/:lessonId', protect, authorize('instructor', 'admin'), deleteLesson);
router.put('/:id/lessons-order', protect, authorize('instructor', 'admin'), reorderLessons);

// Admin-only course approval toggle
router.put('/:id/status', protect, authorize('admin'), updateCourseStatus);

module.exports = router;
