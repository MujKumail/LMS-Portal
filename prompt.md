# LMS (Learning Management System) Portal

## Context and Role

As a Frontend Developer specializing in modern web experiences you are responsible for designing and implementing a high performance personal Learning Management System (LMS).

The platform must deliver an intuitive, engaging learning environment for both students and instructors using:

- Smooth UI transitions
- React for component-driven architecture
- A Node.js backend for course management, authentication and progress tracking

The LMS should feel less like a utility and more like an experience one that motivates learners to keep going, helps instructors track progress effortlessly and makes education accessible and enjoyable.

The system must be:

- Secure
- Scalable
- Production-ready

---

# Objective

Develop a complete full stack portfolio LMS portal that:

- Delivers a role based experience for Students, Instructors and Admins.
- Implements smooth, animated UI transitions using Framer Motion for an engaging learning journey 
- Provides a course catalog, enrollment system and lesson viewer with clean UX 
- Tracks and visualizes learner progress through interactive dashboards .
- Includes a secure authentication system with login, registration and password recovery 
- Supports video/document content delivery for lessons
- Sends email notifications for enrollment confirmations, progress milestones and instructor announcements
- Stores all data securely with proper validation, sanitization and error handling


---

# UI and Animation Requirements

## Animated Learner Experience

Use Framer Motion for:

- Page transitions
- Card entrances
- Dashboard reveals

### Implement:

- Staggered animations on:
  - Course cards
  - Lesson lists
  - Progress indicators

- Smooth fade ins and slide ups between sections

- Animated progress bars reflecting completion percentage

### Ensure Animations:

- Are performant (GPU friendly using transform and opacity)
- Do not block scrolling or navigation
- Respect reduced motion accessibility settings

---

# Layout Requirements

## Landing / Home Page

Include:

- Animated hero section
- Tagline and CTA:
  - Start Learning
  - Explore Courses

- Featured courses section
- Testimonials carousel
- Footer with:
  - Quick links
  - Newsletter signup

---

## Student Dashboard

Features:

- Enrolled courses with animated progress rings
- Recently accessed lessons
- Upcoming deadlines
- Announcements
- Recommended courses

---

## Instructor Dashboard

Features:

- Course creation and management
- Student enrollment statistics
- Animated data visualizations
- Lesson upload and ordering
- Drag and drop support
- Announcement broadcast panel

---

## Admin Dashboard

Features:

- User management table
- Platform analytics
- Course approval/rejection workflow
- System notification controls

---

## Course Detail Page

Include:

- Animated lesson syllabus accordion
- Instructor bio
- Enrollment CTA with modal
- Reviews and ratings

---

## Authentication Pages

Pages:

- Login
- Register
- Forgot Password

Features:

- Animated transitions
- Validation feedback
- OAuth support (Google Login)

---

## Layout Requirements

The portal must be:

- Fully responsive
- Accessible
- SEO optimized
- Performance optimized

---

# Contact System Requirements

## Contact Instructor / Help Modal

Accessible from:

- Course pages
- Student dashboard

Features:

- Framer Motion animated modal
- Scale + fade transitions

---

## Contact Form Fields

- Name (required)
- Email (required)
- Subject dropdown:
  - Course Issue
  - Technical Problem
  - General Query
- Message (required)

---

## Validation

Implement:

- Client side validation
- Inline error messages
- Disabled invalid submissions
- Loading state during submit

---

# Backend Requirements

## API Architecture

Use:

- Node.js + Express
- OR Next.js API Routes

---

## Core Modules

### Auth API

- Register
- Login
- Logout
- Refresh Token
- Password Reset

### User API

- Profile management
- Role assignment

### Course API

- CRUD operations
- Categories
- Enrollment

### Lesson API

- Lesson CRUD
- Content upload

### Progress API

- Track lesson completion

### Notification API

- Email notifications

---

# Email Notifications

Use:

- Nodemailer
- OR transactional email APIs

## Trigger Emails For:

- Enrollment confirmation
- Welcome email
- Progress milestones
- Instructor announcements
- Contact form submissions

## Each Email Must Include:

- Recipient name
- Course/action details
- Timestamp
- Branded HTML template

---

# Security

Implement:

- Environment variables
- bcrypt password hashing
- JWT authentication
- Refresh token rotation
- Middleware route protection
- Rate limiting
- Input sanitization
- XSS/injection protection

---

# Database

Use:

- MongoDB + Mongoose
- OR PostgreSQL + Prisma

## Collections / Tables

### Users

- Roles
- Profiles
- Auth tokens

### Courses

- Metadata
- Lessons
- Instructor references

### Enrollments

- Student course mapping
- Progress tracking

### Contact Logs

- Contact form submissions

---

# Data Processing Requirements

- Sanitize all inputs
- Validate:
  - Email
  - Phone numbers
  - Required fields

- Return structured JSON responses

---

# API Response Structure

## Success Response

```json
{
  "success": true,
  "message": "Operation successful"
}
```

## Error Response

```json
{
  "success": false,
  "error": "Something went wrong"
}
```

---

# Output Requirements

The system must include:

- Fully animated LMS portal
- Role aware experiences
- Functional course enrollment
- Lesson viewing system
- Email notifications
- User confirmation messages
- Graceful error handling
- Admin oversight tools

---

# Error Handling and Documentation

## Error Handling

- User friendly frontend errors
- Backend logging with timestamps
- Structured API error responses

---

## Documentation Must Include

- Folder structure
- Setup instructions
- Environment variables
- Database schema
- Seed data setup
- Deployment instructions

---

# Performance and Scalability

Implement:

- Lazy loading
- Pagination/infinite scrolling
- Image optimization
- Video thumbnail optimization
- Debounced search/filter
- Efficient animations
- Async/await optimization
- Database indexing

## Goals

Achieve strong Lighthouse scores for:

- Performance
- Accessibility
- SEO

---

# Technology Stack

## Frontend

- React
- Framer Motion
- Tailwind CSS
- React Query OR SWR

---

## Backend

- Node.js + Express
- OR Next.js API Routes

### Tools

- Nodemailer
- JWT
- bcrypt
- dotenv

---

# Database

Choose one:

- MongoDB + Mongoose
- PostgreSQL + Prisma

---

# Optional Features

- Redis caching
- Session management
- Stripe payment integration
- Paid course enrollment
