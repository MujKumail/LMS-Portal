const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { sendEnrollmentEmail, sendMilestoneEmail } = require('../utils/mailer');

// 1. ENROLL STUDENT IN COURSE
const enrollCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate('instructor');
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    if (course.status !== 'approved') {
      return res.status(400).json({ success: false, error: 'This course is pending academic review and cannot be enrolled in yet.' });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (existing) {
      return res.status(400).json({ success: false, error: 'You are already enrolled in this course.' });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      progress: 0,
      completedLessons: []
    });

    // Send Enrollment email asynchronously
    sendEnrollmentEmail(req.user, course).catch(err => 
      console.error(`Milestone trigger failed: sendEnrollmentEmail to ${req.user.email}`, err)
    );

    res.status(201).json({
      success: true,
      message: `Successfully enrolled in "${course.title}"! Happy learning.`,
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET CURRENT STUDENT ENROLLED COURSES
const getMyCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id }).populate('course');
    res.json({
      success: true,
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

// 3. MARK LESSON AS COMPLETE (Triggers progress and milestone calculations)
const completeLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Student enrollment record not found for this course.' });
    }

    // Check if lesson is valid
    const lessonExists = course.lessons.some(l => l._id.toString() === lessonId);
    if (!lessonExists) {
      return res.status(404).json({ success: false, error: 'Lesson not found in the course syllabus.' });
    }

    // Check if already completed
    const lessonIdx = enrollment.completedLessons.indexOf(lessonId);
    const prevProgress = enrollment.progress;

    if (lessonIdx === -1) {
      // Add completion
      enrollment.completedLessons.push(lessonId);
    } else {
      // Optional: Toggle to incomplete if student clicks again
      enrollment.completedLessons.splice(lessonIdx, 1);
    }

    // Calculate percentage progress
    const totalLessons = course.lessons.length;
    const completedCount = enrollment.completedLessons.length;
    const newProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    enrollment.progress = newProgress;

    // Milestone Checkers
    if (prevProgress < 50 && newProgress >= 50) {
      console.log(`🏆 [Milestone] Student ${req.user.name} completed 50% of "${course.title}"! Triggering email...`);
      sendMilestoneEmail(req.user, course, 50).catch(err => 
        console.error('Milestone email trigger error:', err)
      );
    }

    if (prevProgress < 100 && newProgress === 100) {
      console.log(`🎓 [Completion] Student ${req.user.name} fully completed "${course.title}"! Triggering completion email...`);
      enrollment.completedAt = new Date().toISOString();
      sendMilestoneEmail(req.user, course, 100).catch(err => 
        console.error('Milestone 100% email trigger error:', err)
      );
    } else if (newProgress < 100) {
      // Reset completedAt if they unchecked a lesson
      enrollment.completedAt = null;
    }

    const updated = await Enrollment.findByIdAndUpdate(enrollment._id, {
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      completedAt: enrollment.completedAt
    }, { new: true });

    res.json({
      success: true,
      message: lessonIdx === -1 ? 'Lesson marked as completed!' : 'Lesson marked as incomplete.',
      progress: updated.progress,
      completedLessons: updated.completedLessons,
      completedAt: updated.completedAt
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollCourse,
  getMyCourses,
  completeLesson
};
