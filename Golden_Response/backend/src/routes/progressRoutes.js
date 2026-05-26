const express = require('express');
const router = express.Router();
const {
  enrollCourse,
  getMyCourses,
  completeLesson
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// All endpoints require student authentication context
router.post('/enroll/:courseId', protect, enrollCourse);
router.get('/my-courses', protect, getMyCourses);
router.post('/complete-lesson/:courseId/:lessonId', protect, completeLesson);

module.exports = router;
