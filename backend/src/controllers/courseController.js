const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { sendAnnouncementEmail } = require('../utils/mailer');

// 1. GET ALL COURSES (supports search, category, status filters)
const getCourses = async (req, res, next) => {
  try {
    const { category, search, instructorId, status } = req.query;
    let query = {};

    // By default, students and public only see "approved" courses
    // Instructors and Admins can query pending/rejected courses
    if (status) {
      query.status = status;
    } else {
      query.status = 'approved';
    }

    if (category) {
      query.category = category;
    }

    if (instructorId) {
      query.instructor = instructorId;
    }

    let courses = await Course.find(query).populate('instructor').sort({ createdAt: -1 });

    // Handle debounced search keyword filter
    if (search) {
      const keyword = search.toLowerCase();
      courses = courses.filter(c => 
        c.title.toLowerCase().includes(keyword) || 
        c.subtitle?.toLowerCase().includes(keyword) ||
        c.description.toLowerCase().includes(keyword)
      );
    }

    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET SINGLE COURSE BY ID
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    // Populate instructor
    const users = await User.find({});
    const courseObj = JSON.parse(JSON.stringify(course));
    const inst = users.find(u => u._id.toString() === course.instructor.toString());
    if (inst) {
      const { password, ...instData } = inst;
      courseObj.instructor = instData;
    }

    // Sort course lessons by their order property
    if (courseObj.lessons) {
      courseObj.lessons.sort((a, b) => a.order - b.order);
    }

    res.json({
      success: true,
      course: courseObj
    });
  } catch (error) {
    next(error);
  }
};

// 3. CREATE COURSE
const createCourse = async (req, res, next) => {
  try {
    const { title, subtitle, description, category, price, thumbnail } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, error: 'Please provide title, description and category.' });
    }

    const course = await Course.create({
      title,
      subtitle,
      description,
      category,
      price: parseFloat(price) || 0,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      instructor: req.user._id,
      lessons: [],
      // Instructors need Admin approval. Admins are auto-approved.
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });

    res.status(201).json({
      success: true,
      message: req.user.role === 'admin' 
        ? 'Course created and published successfully!' 
        : 'Course submitted successfully. Pending Admin approval.',
      course
    });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE COURSE
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    // Verify course ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. You do not own this course.' });
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({
      success: true,
      message: 'Course updated successfully!',
      course: updated
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE COURSE
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. You do not own this course.' });
    }

    await Course.deleteOne({ _id: req.params.id });
    // Cleanup enrollments
    await Enrollment.deleteMany({ course: req.params.id });

    res.json({
      success: true,
      message: 'Course and related student enrollments deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// 6. BROADCAST ANNOUNCEMENT
const broadcastAnnouncement = async (req, res, next) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Please enter announcement title and body.' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    // Find all enrolled students
    const enrollments = await Enrollment.find({ course: course._id }).populate('student');
    
    // Broadcast emails asynchronously to avoid blocking API
    enrollments.forEach(e => {
      if (e.student && e.student.email) {
        sendAnnouncementEmail(e.student, course, title, message).catch(err => 
          console.error(`Failed to send announcement to ${e.student.email}:`, err)
        );
      }
    });

    res.json({
      success: true,
      message: `Announcement successfully broadcasted to ${enrollments.length} enrolled students!`
    });
  } catch (error) {
    next(error);
  }
};

// 7. LESSON MANAGEMENT - ADD LESSON
const addLesson = async (req, res, next) => {
  try {
    const { title, content, type, duration } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Lesson title and content are required.' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const nextOrder = course.lessons.length > 0
      ? Math.max(...course.lessons.map(l => l.order || 0)) + 1
      : 1;

    const newLesson = {
      title,
      content,
      type: type || 'video',
      duration: duration || '10 mins',
      order: nextOrder
    };

    course.lessons.push(newLesson);
    await Course.findByIdAndUpdate(course._id, { lessons: course.lessons });

    res.status(201).json({
      success: true,
      message: 'Lesson added to syllabus successfully!',
      lesson: course.lessons[course.lessons.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// 8. LESSON MANAGEMENT - UPDATE LESSON
const updateLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { title, content, type, duration } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const index = course.lessons.findIndex(l => l._id.toString() === lessonId);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Lesson not found in syllabus.' });
    }

    if (title) course.lessons[index].title = title;
    if (content) course.lessons[index].content = content;
    if (type) course.lessons[index].type = type;
    if (duration) course.lessons[index].duration = duration;

    await Course.findByIdAndUpdate(course._id, { lessons: course.lessons });

    res.json({
      success: true,
      message: 'Lesson updated successfully!',
      lesson: course.lessons[index]
    });
  } catch (error) {
    next(error);
  }
};

// 9. LESSON MANAGEMENT - DELETE LESSON
const deleteLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const initialLength = course.lessons.length;
    course.lessons = course.lessons.filter(l => l._id.toString() !== lessonId);
    
    if (course.lessons.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Lesson not found in syllabus.' });
    }

    // Reorder remaining lessons
    course.lessons.forEach((l, idx) => {
      l.order = idx + 1;
    });

    await Course.findByIdAndUpdate(course._id, { lessons: course.lessons });

    res.json({
      success: true,
      message: 'Lesson deleted and remaining re-indexed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// 10. DRAG-AND-DROP REORDER LESSONS
const reorderLessons = async (req, res, next) => {
  try {
    const { orderedIds } = req.body; // Array of lesson IDs in preferred order
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: 'Please provide an ordered array of lesson IDs.' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    // Re-index their orders
    const updatedLessons = course.lessons.map(lesson => {
      const idx = orderedIds.indexOf(lesson._id.toString());
      return {
        ...lesson,
        order: idx !== -1 ? idx + 1 : 99 // Put unlisted items at the end
      };
    });

    // Sort by new order
    updatedLessons.sort((a, b) => a.order - b.order);

    await Course.findByIdAndUpdate(course._id, { lessons: updatedLessons });

    res.json({
      success: true,
      message: 'Lesson order updated and synchronized successfully!',
      lessons: updatedLessons
    });
  } catch (error) {
    next(error);
  }
};

// 11. ADMIN - APPROVE / REJECT COURSE WORKFLOW
const updateCourseStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid approval status.' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, { status }, { new: true });

    res.json({
      success: true,
      message: `Course status successfully set to: ${status}`,
      course: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
