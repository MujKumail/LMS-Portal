# LMS (Learning Management System) Portal

## Context and Role
As a Frontend Developer specializing in modern web experiences, you are responsible for designing and implementing a high-performance personal Learning Management System (LMS).

The platform must deliver an intuitive, engaging learning environment for both students and instructors, with:
- smooth UI transitions
- React-based component-driven architecture
- a Node.js backend for course management, user authentication, and progress tracking

The LMS should feel less like a utility and more like an experience: it should motivate learners, help instructors track progress effortlessly, and make education accessible and enjoyable. The system must be secure, scalable, and production-ready.

## Objective
Develop a complete full-stack portfolio LMS portal that:
- delivers a role-based experience for Students, Instructors, and Admins
- implements smooth, animated UI transitions using Framer Motion for an engaging learning journey
- provides a course catalog, enrollment system, and lesson viewer with clean UX
- tracks and visualizes learner progress through interactive dashboards
- includes secure authentication with login, registration, and password recovery
- supports video and document content delivery for lessons
- sends email notifications for enrollment confirmations, progress milestones, and instructor announcements
- stores all data securely with validation, sanitization, and error handling

## UI and Animation Requirements
### Animated Learner Experience
- Use Framer Motion for page transitions, card entrances, and dashboard reveals
- Implement staggered animations on course cards, lesson lists, and progress indicators
- Use smooth fade-ins and slide-ups when navigating between sections
- Animate progress bars as they fill to reflect completion percentage

### Animation Guidelines
Animations must:
- be performant (GPU-friendly: transform and opacity only)
- not block scrolling or navigation performance
- respect the user's preferred reduced motion setting for accessibility

## Layout Requirements
### Landing / Home Page
- animated hero section with tagline and CTA (Start Learning / Explore Courses)
- featured courses section with staggered card animations
- testimonials section with smooth carousel transitions
- footer with quick links and newsletter signup

### Student Dashboard
- enrolled courses with animated progress rings
- recently accessed lessons
- upcoming deadlines and announcements
- recommended courses based on enrolled categories

### Instructor Dashboard
- course creation and management interface
- student enrollment stats with animated data visualizations
- lesson upload and ordering interface (drag and drop)
- announcement broadcast panel

### Admin Dashboard
- user management table (Students, Instructors)
- platform-wide analytics (enrollment trends, completion rates)
- course approval/rejection workflow
- system notification controls

### Course Detail Page
- animated lesson syllabus accordion
- instructor bio section
- enrollment CTA with modal confirmation
- reviews and ratings section

### Authentication Pages
- login, register, and forgot password screens
- animated form transitions and validation feedback
- OAuth option (Google login)

### General Layout Requirements
The layout must be:
- fully responsive (mobile, tablet, desktop)
- accessible (ARIA labels, semantic HTML, keyboard navigation)
- optimized for performance and SEO, especially on the landing and catalog pages

## Contact System Requirements
### Contact Instructor / Get Help Modal
- accessible from course pages and the student dashboard
- opens an animated modal using Framer Motion
- modal animates on entrance and exit with scale and fade

### Contact Form Fields
- Name (required)
- Email (required, validated)
- Subject (dropdown: Course Issue / Technical Problem / General Query)
- Message (required)

### Validation Requirements
- client-side validation with clear, inline error messages
- prevent submission if required fields are empty or invalid
- show a loading state on the submit button while the request is processing

## Backend Requirements
### API Architecture
Build RESTful API endpoints using Node.js + Express (or Next.js API routes).

Implement the following core modules:
- Auth API: Register, Login, Logout, Refresh Token, Password Reset
- User API: Profile management, role assignment
- Course API: CRUD for courses, categories, and enrollment
- Lesson API: CRUD for lessons, content upload handling
- Progress API: Track and update lesson completion per user
- Notification API: Trigger email notifications for key events

### Email Notification Requirements
Use Nodemailer or a transactional API to send emails for:
- enrollment confirmation, sent to a student upon course enrollment
- welcome email, sent to new users upon registration
- progress milestone, sent when a student reaches 50% and 100% completion
- instructor announcement, forwarded to all enrolled students
- contact form submission, delivered to the platform admin or instructor

Each email must include:
- recipient name
- relevant course or action detail
- timestamp
- a clean, branded HTML email template

### Security Requirements
- store all credentials and config in environment variables
- hash passwords using bcrypt
- use JWT for session management with refresh token rotation
- protect private routes with middleware authentication checks
- apply rate limiting on auth and contact endpoints to prevent abuse
- sanitize all inputs to prevent XSS and injection attacks

### Database Requirements
Use MongoDB with Mongoose or PostgreSQL with Prisma for:
- users (role, profile, auth tokens)
- courses (metadata, lessons, instructor reference)
- enrollments (student-course mapping and progress)
- submissions / contact logs

## Data Processing Requirements
- sanitize all user inputs before storing or processing
- validate email format, phone (if collected), and required field presence
- return structured JSON responses from all API endpoints

### Structured API Responses
API responses should include:
- success message
- error message (if applicable)

## Output Requirements
Deliver:
- a fully animated, role-aware LMS portal
- a functional course enrollment and lesson viewing system
- email notifications triggered by key user actions
- user-facing confirmation messages after form submissions
- graceful error handling across all frontend and backend flows
- an admin panel with platform oversight capabilities

## Error Handling and Documentation
- handle frontend form and API errors with user-friendly messages
- log backend failures with timestamps and request context
- provide structured error responses for all API failures

Document the following:
- complete folder/project structure
- local setup and installation instructions
- environment variable reference
- database schema and seed data instructions
- deployment steps (Vercel / Railway / Render or Docker)

## Performance and Scalability
- lazy load course cards, lesson content, and dashboard components
- implement pagination or infinite scroll on the course catalog
- optimize images and video thumbnails
- debounce search and filter inputs
- ensure animations do not block interactivity or degrade FPS
- support concurrent users without API bottlenecks using async/await and proper DB indexing
- achieve strong Lighthouse scores for Performance, Accessibility, and SEO

## Technology Stack
### Frontend
- React
- Framer Motion (animations and transitions)
- Tailwind CSS (utility-first styling)

### Backend
- Node.js + Express or Next.js API routes
- Nodemailer (email service)
- JWT + bcrypt (auth and security)
- dotenv (environment configuration)

### Database
- MongoDB with Mongoose, or PostgreSQL with Prisma

### Optional
- Redis for caching and session management
- Stripe integration for paid course enrollment
