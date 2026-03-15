# Student Management System (SMS)
### General Sir John Kotelawala Defence University — Faculty of Computing
**Module:** Software Construction Technologies & Tools (SE31012)  
**Student ID:** D/BSE/24/0026

---

## Project Overview

A web-based Student Management System built for university administrators to manage student records, courses, and audit trails. The system is designed following a service-oriented architecture using React for the frontend and Supabase as the backend-as-a-service platform.

---

## Architecture

The system follows a **service-oriented architecture** where each concern is handled by a dedicated service:

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React + Vite | User interface and client logic |
| Auth Service | Supabase Auth | Admin login and session management |
| Database Service | Supabase PostgreSQL | Student, course and audit log data |
| Storage Service | Supabase Storage | Student photos and course banners |
| API Layer | Supabase REST API | Communication between frontend and backend |

> The frontend is fully decoupled from the backend through Supabase's REST API, following the separation of concerns principle. Each Supabase service (Auth, Database, Storage) operates independently, mirroring the microservices design described in the system proposal.

---

## Features

### Functionality
- ✅ **Student Registration** — Add students with auto-generated unique IDs
- ✅ **Unique ID Generation** — Format: `D/BSE/24/0001` based on degree program
- ✅ **Course Management** — Add, edit and delete courses with banner images
- ✅ **Student Management** — Edit and delete student records
- ✅ **Search & Retrieve** — Global search bar + per-page filtering
- ✅ **Audit Trail** — Every action logged with timestamp and real IP address

### Pages
-  Login
-  Dashboard
-  Students
-  Courses
-  Activities (Audit Log)
-  Profile
-  Settings

---

## Design Patterns Used

### Repository Pattern
Business logic is separated from UI components through utility modules:
```
src/lib/
  ├── studentUtils.js   — Student ID generation, form validation, audit descriptions
  └── getIP.js          — IP address retrieval service
```

Key functions in `studentUtils.js`:
- `buildStudentId(degree, count)` — Generates unique student IDs
- `validateStudentForm(form)` — Validates required form fields
- `buildAuditDescription(action, firstName, lastName)` — Builds audit log messages
- `buildLogId(timestamp)` — Generates unique log entry IDs

### Single Responsibility Principle
Each component handles one concern:
- `Students.jsx` — Student CRUD operations only
- `Courses.jsx` — Course CRUD operations only
- `Activities.jsx` — Audit log display only
- `Layout.jsx` — Navigation and global search only

---

## Unit Testing

Testing is implemented using **Vitest** and **@testing-library/react**.
```
npm run test              # Run all tests
npm run test -- --coverage  # Run with coverage report
```

### Coverage Results
| Metric | Coverage |
|---|---|
| Statements | 93.33% |
| Branches | 92.3% |
| Functions | 100% |
| Lines | 91.66% |

> Coverage exceeds the required 20% threshold significantly.

### Test Files
```
src/tests/
  ├── studentUtils.test.js  — 15 tests covering ID generation, validation, audit logs
  └── auditLog.test.js      — 3 tests covering audit log entry formatting
```

---

## Tools & Technologies

| Tool | Version | Purpose |
|---|---|---|
| React | 18+ | Frontend UI library |
| Vite | 4+ | Build tool and dev server |
| Supabase | Latest | Backend-as-a-Service |
| Vitest | Latest | Unit testing framework |
| @testing-library/react | Latest | React component testing |
| @phosphor-icons/react | Latest | Icon library |

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- npm v9+
- A Supabase account

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/YOURUSERNAME/student-management-system.git
cd student-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the project root:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase tables**

Run these in your Supabase SQL Editor:
```sql
-- Students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT,
  dob DATE,
  degree_program TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  course_details TEXT,
  semester INT,
  banner_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id TEXT NOT NULL,
  description TEXT,
  activity_type TEXT,
  performed_by TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open in browser**
```
http://localhost:5173
```

---

## Security

- Admin credentials managed via Supabase Auth
- Supabase API keys stored in `.env` file — never committed to version control
- `.env` is listed in `.gitignore`
- Row Level Security (RLS) can be enabled in Supabase for production

---

## Project Structure
```
sms-frontend/
├── public/
├── src/
│   ├── components/
│   │   └── Layout.jsx
│   ├── lib/
│   │   ├── studentUtils.js
│   │   └── getIP.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Students.jsx
│   │   ├── Courses.jsx
│   │   ├── Activities.jsx
│   │   ├── Profile.jsx
│   │   └── Settings.jsx
│   ├── tests/
│   │   ├── studentUtils.test.js
│   │   └── auditLog.test.js
│   ├── App.jsx
│   ├── main.jsx
│   └── supabase.js
├── .env
├── .env.example
├── .gitignore
├── vite.config.js
└── README.md
```

---

## Maintainability

- Database credentials externalized to `.env` file
- Changing Supabase project only requires updating `.env`
- No hardcoded credentials in source code
- Component-based architecture allows independent updates

---

##  Author

**D/BSE/24/0026**  
General Sir John Kotelawala Defence University  
Faculty of Computing — Intake 41