# LMS Portal: Unified Full-Stack Learning Management System

Welcome to the high-performance **LMS Portal**, an immersive educational portal designed with React, Framer Motion, and Node.js. The platform has been tailored for premium design, security, role-aware dashboards (Student, Instructor, Admin), and zero-setup offline execution.

---

## 🚀 Architectural Features

1. **Dual-Mode Database Layer**: Intelligent Mongoose adapter that automatically detects the absence of a live MongoDB service and falls back to a **high-performance JSON-file database** under `backend/.data/`. Operating with zero dependencies locally, while being 100% production-ready!
2. **Branded HTML Emails**: Polish transactional templates sent via Nodemailer for registration welcome, enrollment receipt, milestone successes (50% and 100%), support inquiries, and updates. Logs automatically to `backend/logs/emails.log` if SMTP is offline.
3. **GPU-Friendly Framer Motion Animations**: Staggered cards entry curves, collapsible heights accordion syllabi, spring sliders, and **visual SVG Progress Rings** that update in real-time.
4. **Security Checkpoints**: Recursive XSS input sanitizers, rate-limiting on support and authentication pipelines, JWT access token rotators, and password salting with `bcryptjs`.

---

## 🛠️ Unified Installation & Setup

Ensure you have **Node.js (v20.11.0+)** and **npm** installed.

### Step 1: Clone or Open Workspace
Verify you are operating in the `c:\Users\Admin\EtharaAI` directory.

### Step 2: Seed the Sandbox Database
Open a terminal shell and seed the JSON/MongoDB databases:
```bash
cd backend
npm run seed
```

### Step 3: Start the Backend Server
```bash
# Still in backend directory
npm start
# (Server runs on port 5000)
```

### Step 4: Launch the Frontend Web Interface
Open a separate terminal window:
```bash
cd frontend
npm run dev
# (Vite launches the React application on port 3000)
```

---

## 🎯 Test Driving Sandbox Accounts

Explore specialized dashboards immediately using these pre-seeded sandbox accounts:

1. **Student Account**:
   - **Email**: `student@lms.com`
   - **Password**: `password`
   - *Alternative*: Click the **"One-Click Google Sandbox Login"** button on the sign-in screen to instantly authenticate as **Sarah Connor**.
   
2. **Instructor Account**:
   - **Email**: `instructor@lms.com`
   - **Password**: `password`

3. **Admin Account**:
   - **Email**: `admin@lms.com`
   - **Password**: `password`

---

## 📂 Tech Stack Reference

- **Frontend**: React v18, Vite v5, Framer Motion v11, Tailwind CSS v3, Axios, Lucide Icons.
- **Backend**: Node.js, Express, Mongoose, jsonwebtoken, bcryptjs, express-rate-limit, nodemailer.
- **Database**: Dual-Mode (MongoDB Atlas or JSON-File storage).
