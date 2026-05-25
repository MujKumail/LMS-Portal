LMS (Learning Management System) Portal

Context and Role
As a Frontend Developer specializing in modern web experiences, you are responsible for designing and implementing a high performance personal Learning Management System(LMS). The platform must deliver an intuitive, engaging learning environment for both students and instructors for smooth UI transitions, React for component driven architecture and a Node js backend for course management system, user authentication and progress tracking. 
The LMS should feel less like a utility and more like an experience, one that motivates learners to keep going, helps instructors track progress effortlessly and make education accessible and enjoyable. The system must be secure, scalable and production ready. 
Objective
Develop a complete full stack portfolio LMS portal that:
Delivers a role based experience for Students, Instructors and Admins.
Implements smooth, animated UI transitions using Framer Motion for an engaging learning journey 
Provides a course catalog, enrollment system, and lesson viewer with clean UX 
Tracks and visualizes learner progress through interactive dashboards .
Includes a secure authentication system with login, registration and password recovery 
Supports video/document content delivery for lessons
Sends email notifications for enrollment confirmations, progress milestones, and instructor announcements
Stores all data securely with proper validation, sanitization, and error handling



UI and Animation Requirements
Animated Learner Experience 
Use Framer Motion for page transitions, card entrances and dashboard reveals 


Implement staggered animations on course cards, lesson lists, and progress indicators.


Use smooth fade-ins and slide-ups when navigating between sections .


Animate progress bars as they fill to reflect completion percentage 


Ensure animations:


Are performant (GPU friendly: transform, opacity only) 


Do not block scroll or navigation performance 


Respect the user's preferred reduced motion setting for accessibility 


Layout Requirements
The lms portal must include:
Landing / Home Page 
Animated hero section with tagline and CTA (Start Learning / Explore Courses)
Featured courses section with staggered card animations
Testimonials section with smooth carousel transitions
Footer with quick links and newsletter signup


Student Dashboard 
Enrolled courses with animated progress rings
Recently accessed lessons
Upcoming deadlines and announcements
Recommended courses based on enrolled categories


Instructor Dashboard 
Course creation and management interface
Student enrollment stats with animated data visualizations
Lesson upload and ordering interface (drag and drop)
Announcement broadcast panel


Admin Dashboard 
User management table (Students, Instructors)
Platform wide analytics (enrollment trends, completion rates)
Course approval/rejection workflow
System notification controls

Course Detail Page 
Animated lesson syllabus accordion
Instructor bio section
Enrollment CTA with modal confirmation
Reviews and ratings section

Authentication Pages 
Login, Register and Forgot Password screens
Animated form transitions and validation feedback
OAuth option (Google login)



The layout must be:
Fully responsive (mobile, tablet, desktop)
Accessible (ARIA labels, semantic HTML, keyboard navigation)
Optimized for performance and SEO (especially the landing and catalog pages)

Contact System Requirements
Contact Instructor / Get Help Modal 
Accessible from course pages and the student dashboard
Clicking the button opens an animated modal using Framer Motion
Modal animates on entrance and exit (scale + fade)

Contact Form Fields
Name (required)
Email (required, validated)
Subject (dropdown: Course Issue / Technical Problem / General Query)
Message (required)

Validation
Client side validation with clear, inline error messages
Prevent submission if required fields are empty or invalid
Show a loading state on submit button while the request is processing

Backend Requirements
API Architecture
Build RESTful API endpoints using Node.js + Express (or Next.js API routes)
Implement the following core modules:
Auth API - Register, Login, Logout, Refresh Token, Password Reset
User API - Profile management, role assignment
Course API -CRUD for courses, categories, and enrollment
Lesson API - CRUD for lessons, content upload handling
Progress API - Track and update lesson completion per user
Notification API - Trigger email notifications for key events
Email Notifications (Nodemailer or transactional API)
           Trigger emails for:
Enrollment confirmation - sent to student upon enrolling in a course
Welcome email - sent to new users upon registration
Progress milestone - sent when a student completes 50% and 100% of a course
Instructor announcement - forwarded to all enrolled students
Contact form submission - delivered to the platform admin/instructor
      Each email must include:
Recipient name
Relevant course or action detail
Timestamp
A clean, branded HTML email template



Security
Store all credentials and config in environment variables
Hash passwords using bcrypt
Use JWT for session management with refresh token rotation
Protect all private routes with middleware authentication checks
Apply rate limiting on auth and contact endpoints to prevent abuse
Sanitize all inputs to prevent XSS and injection attacks

Database
Use MongoDB (with Mongoose) or PostgreSQL (with Prisma) for:
Users (role, profile, auth tokens)
Courses (metadata, lessons, instructor reference)
Enrollments (student course mapping, progress)
Submissions / Contact logs

Data Processing Requirements
Sanitize all user inputs before storing or processing
Validate email format, phone (if collected) and required field presence
Return structured JSON responses from all API endpoints:


Ensure API returns structured JSON responses:


Success message
Error message (if applicable)



Output Requirements
Fully animated, role aware LMS portal
Functional course enrollment and lesson viewing system
Email notifications triggered on key user actions
User facing confirmation messages after form submissions
Graceful error handling across all flows (frontend + backend)
Admin panel with platform oversight capabilities

Error Handling and Documentation
Handle all frontend form and API errors with user friendly messages
Log backend failures with timestamps and request context
Provide structured error responses for all API failures


Document the following: 


Complete folder/project structure
Local setup and installation instructions
Environment variable reference 
Database schema and seed data instructions
Deployment steps (Vercel / Railway / Render or Docker)

Performance and Scalability
Lazy load course cards, lesson content, and dashboard components
Implement pagination or infinite scroll on the course catalog
Optimize images and video thumbnails (use Next.js or lazy loading)
Debounce search and filter inputs
Ensure animations never block interactivity or degrade FPS
Support concurrent users without API bottlenecks (use async/await + proper DB indexing)
Achieve strong Lighthouse scores (Performance, Accessibility, SEO)

Technology Stack
Use the following:
Frontend:
React 
Framer Motion (animations and transitions)
Tailwind CSS (utility first styling)
React Query or SWR (data fetching and caching)


Backend:
Node.js + Express or Next.js API routes
Nodemailer (email service)
JWT + bcrypt (auth and security)
dotenv (environment configuration)

Database:
MongoDB with Mongoose, or PostgreSQL with Prisma

Optional:
Redis for caching and session management
Stripe integration for paid course enrollment