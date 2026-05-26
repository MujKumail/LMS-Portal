# LMS Portal — Build Brief

---

## Context and Role

We're building a Learning Management System but the framing matters: this is not another CRUD dashboard with a courses table bolted on. The product needs to feel like something learners actually want to open. That means the UI has to carry real weight smooth transitions, role aware flows and a visual language that communicates progress and momentum.

Three types of people will use this daily. Students need clarity and motivation they should be able to see where they are what's next and feel a sense of forward movement. Instructors are usually non technical they need course management that doesn't get in their way. Admins need control without chaos  a single place to handle users, content approvals and platform health.

The stack is React on the frontend with Framer Motion handling all animation work. Backend is Node.js/Express or Next.js API routes either works, just be consistent. Auth runs on JWT with bcrypt, database is MongoDB (Mongoose) or PostgreSQL (Prisma), your call based on what the team is more comfortable with. Every secret lives in environment variables. That's non negotiable.

---

## Objective

Build a working, deployable LMS with the following in place:

- Three separate dashboard experiences student, instructor, admin with their own routing, navigation and permission logic. A student hitting an instructor route should get redirected not a blank screen.
- Framer Motion animations across all major surfaces: hero sections, course card grids, lesson lists, progress rings, and dashboard reveals. These aren't decorative they're part of how the product communicates state.
- Full course lifecycle: instructors create and manage courses, students browse and enroll, lessons play in order, completion gets tracked and stored.
- Auth that actually holds up: JWT with expiry, refresh token rotation, bcrypt on passwords, route guards on both client and server.
- Email triggers on the events that matter enrollment confirmations, milestone alerts, instructor announcements and contact form receipts. Use Nodemailer unless there's a strong reason not to.
- A database schema that's normalized and indexed properly. Don't make the progress tracking queries slow.

---

## Input Data

### Auth and Users

Registration, login, logout, password reset. Google OAuth is a nice-to-have. Every user has a role — student, instructor, admin and that role gates what they can see and do on both ends of the stack. Passwords are hashed before they touch the database. Tokens expire. Refresh rotation is implemented so sessions don't drop unexpectedly.

### Courses and Lessons

Instructors get full CRUD on courses. Each course has an ordered lesson list video, documents or rich text. Lesson ordering needs drag and drop don't implement a clunky up/down arrow system. Enrollment happens through a modal flow, not a page redirect. The enrollment record tracks which lessons are done and surfaces a progress percentage.

### Dashboards

Students see: their enrolled courses with progress rings, recently touched lessons any upcoming deadlines, announcements and a recommended courses block.

Instructors see: their courses in a management table, enrollment numbers per course some form of data visualization (a bar chart is fine) the lesson editor and ordering panel and an announcement tool to push messages to enrolled students.

Admins see: the full user table with role controls, platform analytics (user counts, enrollment rates, completion rates), a course approval queue and notification system controls.

### Landing Page

Public facing. Animated hero with a tagline and two CTAs Start Learning and Explore Courses. Below that: featured courses a testimonials carousel, footer with links and a newsletter field. Keep it fast this is the first thing people see.

### Contact Modal

Accessible from course pages and the student dashboard. Framer Motion scale + fade on open/close. Fields: Name, Email, Subject (dropdown: Course Issue / Technical Problem / General Query), Message. Submission logs to the database and fires an email to whoever needs to see it.

---

## Output Requirements

When this ships it needs to have:

- Full animated portal with role based routing working end to end
- Protected routes client side redirects and server side middleware both in place
- Course catalog, enrollment, and lesson viewer all functional
- Progress data persisting to the database, showing up correctly on dashboards
- All email triggers firing on the right events
- Confirmation messages after every form submission or key action
- The contact modal animating in and out properly
- Sensible error states everywhere no blank screens, no raw error objects shown to users
- A README that a new developer could actually use: folder structure, env variable list, schema docs, seed instructions and deployment steps for at least one production environment

---

## Data Handling

Sanitize everything before it gets near the database. Standard stuff prevent XSS, block injection vectors. Email format validation should be RFC-compliant. Passwords and tokens never appear in API responses or logs add a scrubber if needed.

Every API response uses the same envelope:

```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "error": "..." }
```

No exceptions to this. Inconsistent response shapes are how frontend bugs stay hidden for weeks.

---

## Error Handling and Docs

Validation errors show inline not as browser alerts not as toasts that disappear before the user reads them. API errors return proper HTTP codes alongside the JSON. Backend failures (DB errors, email failures, auth exceptions) get logged with timestamps using Winston or Morgan not console.log.

Documentation needs to actually be useful:

- Folder structure with a one line explanation per major directory
- Every env variable listed with its purpose and a dummy example value
- Database schema with relationships and which fields are indexed
- Seed script instructions so a new dev can get test data running in under five minutes
- Deployment steps for local dev and at least one cloud target (Vercel, Railway or Render all work)

---

## Performance

Heavy components dashboards, the lesson viewer, admin tables get lazy loaded. Don't ship everything in one bundle. List endpoints need pagination; the frontend needs to handle it whether that's numbered pages or infinite scroll. Search and filter inputs get a 300ms debounce before anything fires.

Animations use transform and opacity only nothing that triggers layout recalc. The prefers reduced motion media query must be respected some users have vestibular disorders and motion makes them sick. Don't ignore this.

Rate limiting goes on all API routes. High traffic fields user IDs, course IDs, enrollment status need database indexes. No unhandled promise rejections anywhere in the codebase.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React or Next.js |
| Animation | Framer Motion |
| Styling | Tailwind CSS |
| Data Fetching | React Query or SWR |
| Backend | Node.js + Express or Next.js API routes |
| Auth | JWT + bcrypt |
| Email | Nodemailer or transactional API |
| Config | dotenv |
| Database | MongoDB + Mongoose or PostgreSQL + Prisma |
| Caching (optional) | Redis |
| Payments (optional) | Stripe |

Everything secret goes in .env. Nothing sensitive gets committed. If there's a .env.example file checked in, make sure it has placeholder values only.