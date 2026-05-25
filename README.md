# LMS Portal: Unified Full-Stack Learning Management System

Welcome to **LMS Academy**, a high-performance educational portal designed with React, Framer Motion, and Node.js. The platform delivers a visually stunning, role-aware experience (Student, Instructor, Admin) and is secured with recursive input sanitizers, JWT token rotation, and rate-limiting.

---

## 🚀 Project Overview

The LMS Portal is engineered as a production-quality, decoupled portfolio platform:
- **Interactive Visual Design**: Designed with a sleek dark-mode aesthetic, neon border transitions, glassmorphic panels, and **animated SVG Progress Rings** that dynamically fill as students complete lesson lectures.
- **Accessibility & Performance**: Uses GPU-friendly animations (`transform` and `opacity` only) and fully respects the browser's `prefers-reduced-motion` settings. Includes custom lazy-loading and debounced search filters.
- **Dual-Mode Database Layer**: Intelligent Mongoose adapter that automatically detects the absence of a live MongoDB service and falls back to a **high-performance JSON-file database** under `backend/.data/`. This enables zero-config offline execution while being 100% production-ready for MongoDB Atlas.
- **Polished Transactional Mailer**: Branded HTML templates triggered for welcome, enrollments, milestone achievements (`50%` and `100%` completions), and support inquiries, with automatic log fallbacks to `backend/logs/emails.log`.

---

## 📂 Repository Structure

```
EtharaAI/
├── backend/
│   ├── .data/                 # Auto-generated JSON database storage (Offline mode)
│   ├── logs/                  # Dispatched HTML email transaction logs
│   ├── src/
│   │   ├── config/            # Mongoose connections & DB switches
│   │   ├── controllers/       # Auth, course, progress, contact, and user aggregations
│   │   ├── middleware/        # JWT auth protection, role checks, custom XSS input sanitizers
│   │   ├── models/            # User, Course, Enrollment, ContactLog Schemas
│   │   ├── routes/            # REST API Router endpoints
│   │   └── utils/             # mailer utilities and database seed.js script
│   ├── .env                   # Server environment parameters
│   └── package.json           # Backend dependency mappings
├── frontend/
│   ├── src/
│   │   ├── components/        # Floating Navbar, Footer, SVG ProgressRings, Support modals, Toasts
│   │   ├── context/           # AuthContext (JWT & login), LMSContext (catalog filter & ticket dispatches)
│   │   ├── pages/             # Landing, AuthPages, Syllabus Details, Student/Instructor/Admin dashboards, Viewer
│   │   ├── services/          # api.js axios wrapper with automatic token refresh interceptor
│   │   ├── App.jsx            # Protected roleguards & routing
│   │   ├── index.css          # Custom mesh grids & accessibility rules
│   │   └── main.jsx
│   ├── index.html             # SEO meta optimizations & Outfit typography links
│   ├── tailwind.config.js     # Dark theme layout palettes
│   └── package.json           # Client packages mapping
├── GoldenResponse/
│   └── golden_response.py     # Independent Python benchmark REST server & automated test harness
├── Justification/             # Justification guidelines and notes
├── Prompt/                    # Original prompt requirements reference
├── .gitignore                 # Excludes node_modules, .env, and local databases from Git pushes
└── README.md                  # Root documentation manual (this file)
```

---

## 🛠️ Instructions for Running & Testing

### Option A: Running the JavaScript Full-Stack Code (Vite + Node)

#### 1. Setup Your Active Terminal PATH
If `npm` or `node` are not globally active in your current shell window, run this command in your PowerShell window to activate the portable binary suite:
```powershell
$env:PATH = "C:\Users\Admin\.gemini\antigravity-ide\bin;" + $env:PATH
```

#### 2. Seed the Database
Inside the `backend/` directory, seed the JSON/MongoDB databases:
```bash
cd backend
npm run seed
```
*(This initializes Sarah Connor's student account, courses, and syllabus lessons).*

#### 3. Launch the Backend Server
Inside the `backend/` directory, boot the Express API server:
```bash
npm start
# (The server will boot in local fallback mode and listen on http://localhost:5000)
```

#### 4. Launch the Frontend Web Portal
Open a **new, separate terminal window**, execute the path activator from Step 1, and start Vite:
```bash
cd frontend
npm run dev
# (Vite hosts the portal on http://localhost:3000)
```

---

### Option B: Running the Python Benchmark Server & Test Harness

If you have Python installed, you can launch our self-contained benchmark suite located under the `GoldenResponse/` folder:
```bash
cd GoldenResponse
python golden_response.py
```
*(This starts a standalone REST server on port `5000` simulating the database, auth, and mailers, pings the endpoints with an automated client suite, and logs passing metrics in your CLI).*

---

## 🎯 Exploring Sandbox Accounts

Open `http://localhost:3000` in your web browser. You can immediately log into the platform using these pre-seeded roles:

1. **Student / Learner View**:
   - **Email**: `student@lms.com` | **Password**: `password`
   - *Alternative (Fastest)*: Click the **"One-Click Google Sandbox Login"** button on the sign-in screen to instantly authenticate as **Sarah Connor**.
   
2. **Instructor View**:
   - **Email**: `instructor@lms.com` | **Password**: `password`

3. **Admin Suite View**:
   - **Email**: `admin@lms.com` | **Password**: `password`

---

## 📐 Explanation of the Evaluation Methodology

The `golden_response.py` script serves as our **Ideal Benchmark Reference Solution** to evaluate the correctness, security, and integrity of the LMS Portal architecture:

1. **Zero-Dependency Portability**: Built entirely using Python standard libraries (`http.server`, `hashlib`, `json`, `uuid`) to guarantee it can execute natively on any development environment with zero library overhead.
2. **Automated End-to-End Pipeline**: On startup, it triggers an internal client automation routine that sends HTTP request sequences to itself:
   - **XSS Sanitization Validation**: Submits HTML script payloads to verify the recursive filter successfully strips `<script>` injections.
   - **Hashing & Authentication Verification**: Registers users, salting and hashing credentials, and verifies that login only passes under exact match hashes.
   - **State Machine Progress Calculations**: Enroll a user, mark lesson modules as complete, and mathematically verify that progress calculations trigger milestone alerts at exactly **50%** and **100%** completion.
   - **Email Log Audits**: Records all transactional dispatches in a central file (`emails_python.log`) to audit templates structure, time stamp variables, and recipient addresses.
3. **Fidelity Mocking**: The Python server exposes identical API paths and JSON responses to those consumed by our React interface, serving as an flawless diagnostic twin of the active JavaScript backend!
