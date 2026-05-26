const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const ContactLog = require('../models/ContactLog');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing old data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await ContactLog.deleteMany({});

    console.log('👤 Hashing passwords and generating users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);

    // Create users
    const student = await User.create({
      name: 'Sarah Connor',
      email: 'student@lms.com',
      password: hashedPassword,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    });

    const instructor = await User.create({
      name: 'Dr. Evelyn Martinez',
      email: 'instructor@lms.com',
      password: hashedPassword,
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
    });

    const admin = await User.create({
      name: 'Director Arthur Pendelton',
      email: 'admin@lms.com',
      password: hashedPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    });

    console.log(`✅ Created accounts:\n - Student: ${student.email}\n - Instructor: ${instructor.email}\n - Admin: ${admin.email}`);

    // Create courses
    console.log('📚 Creating sample courses and syllabus lessons...');
    
    const course1 = await Course.create({
      title: 'Full-Stack Web Development Bootcamp',
      subtitle: 'Build industrial-strength web apps with React, Express, and MongoDB.',
      description: 'Go from amateur to absolute expert in web development. In this comprehensive bootcamp, you will cover core Javascript mechanics, React JSX components, clean CSS layouts, Node.js routers, Express servers, JWT integrations, and MongoDB aggregations. We build three full-scale apps from absolute scratch.',
      category: 'Web Development',
      instructor: instructor._id,
      price: 99.99,
      rating: 4.9,
      status: 'approved',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      lessons: [
        {
          title: 'Welcome to the Bootcamp: Overview & Goals',
          content: 'https://www.w3schools.com/html/mov_bbb.mp4',
          type: 'video',
          duration: '08:45',
          order: 1
        },
        {
          title: 'Essential Syntax: JavaScript ES6+ Breakdown',
          content: 'Javascript is the fuel of modern web apps. Today we cover Arrow Functions, Destructuring, Rest/Spread operators, Async/Await syntax, and JS Modules.',
          type: 'document',
          duration: '15 mins read',
          order: 2
        },
        {
          title: 'React Fundamentals: JSX and Component Architecture',
          content: 'https://www.w3schools.com/html/movie.mp4',
          type: 'video',
          duration: '14:20',
          order: 3
        },
        {
          title: 'Advanced State Management: Context API & Reducer Hooks',
          content: 'Understand state hoisting, prop drilling limits, and native Context API implementations to centralize user preferences and caching.',
          type: 'document',
          duration: '20 mins read',
          order: 4
        },
        {
          title: 'Connecting the Backend: CORS, Axios, and REST Integration',
          content: 'https://www.w3schools.com/html/mov_bbb.mp4',
          type: 'video',
          duration: '22:15',
          order: 5
        }
      ]
    });

    const course2 = await Course.create({
      title: 'Framer Motion: Interactive Fluid UI Animations',
      subtitle: 'Wow your users with staggered reveals, spring physics, and fluid page transitions.',
      description: 'Animations shouldn\'t feel like an afterthought. In this premium UI course, you will learn the core foundations of Framer Motion in React. We cover hover micro-interactions, layout transitions, keyframes, drag-to-dismiss modals, scroll-linked animations, and staggered card entrances that feel premium, performant, and delightful.',
      category: 'Design & UI/UX',
      instructor: instructor._id,
      price: 49.99,
      rating: 4.8,
      status: 'approved',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      lessons: [
        {
          title: 'Introduction to Motion: Core Principles',
          content: 'https://www.w3schools.com/html/movie.mp4',
          type: 'video',
          duration: '06:12',
          order: 1
        },
        {
          title: 'Micro-Animations: Hover, Tap, and Focus states',
          content: 'Learn how to apply scale transitions, color gradients, and spring curves to buttons, icons, and menus to engage users on interaction.',
          type: 'document',
          duration: '10 mins read',
          order: 2
        },
        {
          title: 'Staggered Layouts: Grid Cards & List Disclosures',
          content: 'https://www.w3schools.com/html/mov_bbb.mp4',
          type: 'video',
          duration: '11:45',
          order: 3
        },
        {
          title: 'Page Transitions: AnimatePresence Page Routing',
          content: 'Setup routing animations using react-router-dom and AnimatePresence to fade-in and slide-up subpages gracefully without hard UI jumps.',
          type: 'document',
          duration: '18 mins read',
          order: 4
        }
      ]
    });

    const course3 = await Course.create({
      title: 'Mastering Node.js & Express API Design',
      subtitle: 'Build robust, highly scalable REST APIs with JWT auth, rate limits, and Mongo.',
      description: 'API design is more than just router endpoints. Today we dive deep into production-grade backend design: structure, sanitization, validation layers, refresh token rotations, custom logger fallbacks, rate limit structures, and email dispatch services. Get your API ready for thousands of concurrent requests.',
      category: 'Backend Engineering',
      instructor: instructor._id,
      price: 79.99,
      rating: 4.7,
      status: 'pending',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      lessons: [
        {
          title: 'Project Architecture: Express Boilerplate Setup',
          content: 'https://www.w3schools.com/html/movie.mp4',
          type: 'video',
          duration: '09:30',
          order: 1
        },
        {
          title: 'Security Hardening: CORS, Rate Limits, and XSS Sanitization',
          content: 'An unsecured backend is an open invitation for exploit. In this lecture, we detail the implementation of custom helmet, cors policies, and custom tag parsers.',
          type: 'document',
          duration: '12 mins read',
          order: 2
        }
      ]
    });

    console.log('✅ Created courses successfully!');

    console.log('📈 Setting up default enrollment for student...');
    // Sarah Connor starts with Course 1 (50% progress completed: 2 out of 5 lessons completed)
    const lessons = course1.lessons;
    const completedLessonIds = [lessons[0]._id.toString(), lessons[1]._id.toString()];
    await Enrollment.create({
      student: student._id,
      course: course1._id,
      progress: 40, // 2/5 lessons = 40%
      completedLessons: completedLessonIds,
      enrolledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // enrolled 5 days ago
    });

    console.log('🎉 Seeding successfully completed! App is ready for runtime.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
