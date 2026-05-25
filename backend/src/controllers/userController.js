const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// 1. GET PROFILE
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// 2. UPDATE PROFILE
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updateObj = {};
    if (name) updateObj.name = name;
    if (avatar) updateObj.avatar = avatar;

    const updated = await User.findByIdAndUpdate(req.user._id, updateObj, { new: true });
    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatar: updated.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. STUDENT DASHBOARD AGGREGATIONS
const getStudentDashboard = async (req, res, next) => {
  try {
    // 1. Fetch Enrolled Courses with Course details
    const enrollments = await Enrollment.find({ student: req.user._id }).populate('course');
    
    // 2. Fetch recently accessed lessons (mocked from first 3 enrollments)
    const recentlyAccessed = [];
    enrollments.slice(0, 3).forEach(e => {
      if (e.course && e.course.lessons && e.course.lessons.length > 0) {
        // Grab first incomplete or last complete
        const targetLesson = e.course.lessons[e.completedLessons.length] || e.course.lessons[0];
        recentlyAccessed.push({
          courseId: e.course._id,
          courseTitle: e.course.title,
          lessonId: targetLesson._id,
          lessonTitle: targetLesson.title,
          progress: e.progress,
          thumbnail: e.course.thumbnail
        });
      }
    });

    // 3. Category recommendations: Find courses with categories matching enrolled courses, which the student hasn't enrolled in
    const enrolledCourseIds = enrollments.map(e => e.course ? e.course._id.toString() : '');
    const enrolledCategories = enrollments.map(e => e.course ? e.course.category : '').filter(Boolean);
    const uniqueCategories = [...new Set(enrolledCategories)];

    let recommendations = [];
    if (uniqueCategories.length > 0) {
      recommendations = await Course.find({
        category: { $in: uniqueCategories },
        status: 'approved',
        _id: { $nin: enrolledCourseIds }
      }).populate('instructor').limit(4);
    } else {
      // Fallback: recommend popular courses if not enrolled in any
      recommendations = await Course.find({ status: 'approved' }).populate('instructor').limit(4);
    }

    // 4. Gather upcoming deadlines and announcements (mocked from announcements of enrolled courses)
    const announcements = [
      {
        id: 'ann_1',
        title: 'Midterm Self-Assessment Open',
        message: 'The self-assessment window is now open. Test your skills in React hook constraints!',
        courseTitle: 'Full-Stack Web Development Bootcamp',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString() // 2 days from now
      },
      {
        id: 'ann_2',
        title: 'Live Q&A Session with Evelyn',
        message: 'Join us on Friday for a live Q&A covering spring physics, drag animations, and GPU optimizations.',
        courseTitle: 'Framer Motion: Interactive Fluid UI Animations',
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString() // 4 days from now
      }
    ];

    res.json({
      success: true,
      enrollments,
      recentlyAccessed,
      recommendations,
      announcements
    });
  } catch (error) {
    next(error);
  }
};

// 4. INSTRUCTOR DASHBOARD AGGREGATIONS
const getInstructorDashboard = async (req, res, next) => {
  try {
    // 1. Get all courses created by this instructor
    const courses = await Course.find({ instructor: req.user._id });
    const courseIds = courses.map(c => c._id.toString());

    // 2. Fetch all enrollments for these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } }).populate('student');

    // 3. Compile analytics
    const totalCourses = courses.length;
    const totalStudents = enrollments.length;

    // Sum course reviews ratings
    const avgRating = courses.length > 0 
      ? (courses.reduce((acc, c) => acc + (c.rating || 4.8), 0) / courses.length).toFixed(1)
      : '5.0';

    // Mock total earnings ($10 per enrollment or based on course price)
    const totalEarnings = courses.reduce((acc, c) => {
      const courseEnrollments = enrollments.filter(e => e.course && e.course.toString() === c._id.toString()).length;
      return acc + (courseEnrollments * c.price);
    }, 0);

    // Distribution stats: student enrollments per course
    const courseStats = courses.map(c => {
      const count = enrollments.filter(e => e.course && e.course.toString() === c._id.toString()).length;
      return {
        _id: c._id,
        title: c.title,
        status: c.status,
        price: c.price,
        rating: c.rating,
        enrollmentCount: count
      };
    });

    // Dynamic recent enrollments
    const recentEnrollments = enrollments.slice(0, 5).map(e => {
      const c = courses.find(course => course._id.toString() === e.course.toString());
      return {
        id: e._id,
        studentName: e.student?.name || 'Learner',
        studentEmail: e.student?.email || 'N/A',
        courseTitle: c ? c.title : 'Deleted Course',
        enrolledAt: e.enrolledAt
      };
    });

    res.json({
      success: true,
      stats: {
        totalCourses,
        totalStudents,
        avgRating,
        totalEarnings
      },
      courseStats,
      recentEnrollments
    });
  } catch (error) {
    next(error);
  }
};

// 5. ADMIN DASHBOARD AGGREGATIONS
const getAdminDashboard = async (req, res, next) => {
  try {
    // 1. Core analytics
    const studentCount = await User.countDocuments({ role: 'student' });
    const instructorCount = await User.countDocuments({ role: 'instructor' });
    const totalCourses = await Course.countDocuments({});
    const totalEnrollments = await Enrollment.countDocuments({});

    // 2. Fetch courses needing approval (pending)
    const pendingCourses = await Course.find({ status: 'pending' }).populate('instructor');

    // 3. User lists
    const students = await User.find({ role: 'student' }).select('-password');
    const instructors = await User.find({ role: 'instructor' }).select('-password');

    // 4. Mock Enrollment trends (Enrollment counts over the last 5 months)
    const enrollmentTrends = [
      { month: 'Jan', enrollments: Math.round(totalEnrollments * 0.4) },
      { month: 'Feb', enrollments: Math.round(totalEnrollments * 0.5) },
      { month: 'Mar', enrollments: Math.round(totalEnrollments * 0.7) },
      { month: 'Apr', enrollments: Math.round(totalEnrollments * 0.9) },
      { month: 'May', enrollments: totalEnrollments }
    ];

    res.json({
      success: true,
      stats: {
        studentCount,
        instructorCount,
        totalCourses,
        totalEnrollments
      },
      pendingCourses,
      students,
      instructors,
      enrollmentTrends
    });
  } catch (error) {
    next(error);
  }
};

// 6. ADMIN - GET ALL USERS
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// 7. ADMIN - UPDATE USER ROLE
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || !['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid user role.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');

    res.json({
      success: true,
      message: `User role updated successfully to: ${role}`,
      user: updated
    });
  } catch (error) {
    next(error);
  }
};

// 8. ADMIN - DELETE USER
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    await User.deleteOne({ _id: req.params.id });
    // Clean up enrollment and courses
    if (user.role === 'student') {
      await Enrollment.deleteMany({ student: req.params.id });
    } else if (user.role === 'instructor') {
      const courses = await Course.find({ instructor: req.params.id });
      const courseIds = courses.map(c => c._id);
      await Course.deleteMany({ instructor: req.params.id });
      await Enrollment.deleteMany({ course: { $in: courseIds } });
    }

    res.json({
      success: true,
      message: 'User and all related records deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getStudentDashboard,
  getInstructorDashboard,
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  deleteUser
};
