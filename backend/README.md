# Employee Management System - Backend

Production-ready REST API backend built with Node.js, Express, MongoDB (Mongoose), JWT auth, and RBAC.

## Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** (access + refresh tokens)
- **bcrypt** (password hashing)
- **Multer** (file uploads)
- **Nodemailer** (email)
- **PDFKit** (salary slip PDF)
- **dotenv**, **express-validator**, **CORS**, **Winston**, **Morgan**

## Project Structure

```
backend/
  src/
    config/       db.js, mail.js
    models/       User, EmployeeProfile, Task, Project, Leave, Payroll, Attendance, Reimbursement, Announcement, AuditLog, RefreshToken, LoginAudit
    controllers/
    routes/
    middlewares/  auth, roleCheck, errorHandler, validate, upload, auditLogger, ipRestrict
    services/     authService, emailService, pdfService
    utils/        logger, pagination, dateHelpers
    seed/         runSeed.js
    app.js
    server.js
  .env
  .env.example
  package.json
  README.md
```

## Setup & Run (localhost)

1. **Prerequisites**: Node.js 18+, MongoDB running locally (or use Atlas URI in `.env`).

2. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Environment**: Copy `.env.example` to `.env` and set at least:
   - `MONGODB_URI` (e.g. `mongodb://localhost:27017/employee_management`)
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
   - Optionally: SMTP for emails, `FRONTEND_URL` for CORS

4. **Start server**:
   ```bash
   npm start
   ```
   Or development with auto-reload:
   ```bash
   npm run dev
   ```
   Server runs at **http://localhost:5000** (or `PORT` in `.env`).

5. **Seed data** (optional):
   ```bash
   npm run seed
   ```
   Creates: Admin (`admin@company.com` / `Admin@123`), HR Manager (`hr@company.com` / `Manager@123`), 2 employees, sample project, tasks, leave.

## API Base URL

- Base: `http://localhost:5000/api`
- Health: `GET http://localhost:5000/health`

## API Endpoints Summary

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login (email, password) → accessToken, refreshToken, user |
| POST | /api/auth/refresh | Refresh token → new access + refresh |
| POST | /api/auth/forgot-password | Send reset link (body: email) |
| POST | /api/auth/reset-password | Reset password (body: token, password) |
| POST | /api/auth/logout | Revoke refresh token (body/header: refreshToken) |

### Users & Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List users (search, role, pagination) |
| POST | /api/users | Create user (Admin; body: name, email, password?, role?, employeeId?, department?, designation?, sendEmail?) |
| GET | /api/users/:id | Get user |
| PATCH | /api/users/:id | Update user |
| POST | /api/users/:id/deactivate | Deactivate user (Admin/Manager) |
| GET | /api/users/:userId/profile | Get employee profile |
| PATCH | /api/users/:userId/profile | Update employee profile |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List tasks (assignedTo, project, status, priority, pagination) |
| POST | /api/tasks | Create task |
| GET | /api/tasks/:id | Get task |
| PATCH | /api/tasks/:id | Update task |
| PATCH | /api/tasks/:id/status | Update status (body: status) |
| DELETE | /api/tasks/:id | Delete task |
| POST | /api/tasks/bulk/status | Bulk status update (body: taskIds, status) |
| POST | /api/tasks/:id/comments | Add comment (body: text) |
| POST | /api/tasks/:id/attachments | Upload attachments (multipart) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | List projects |
| POST | /api/projects | Create project (Admin/Manager) |
| GET | /api/projects/:id | Get project |
| GET | /api/projects/:id/gantt | Gantt data |
| PATCH | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Soft delete (isActive: false) |

### Leave
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/leaves | Apply leave |
| GET | /api/leaves | List leaves (employee, status, pagination) |
| GET | /api/leaves/balance | Current user leave balance (query: year) |
| GET | /api/leaves/balance/:userId | User leave balance |
| GET | /api/leaves/:id | Get leave |
| PATCH | /api/leaves/:id/approve | Approve/reject (Admin/Manager; body: action, rejectionReason?) |

### Payroll
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/payroll | List payroll (employee, month, year, pagination) |
| POST | /api/payroll/generate | Generate payroll + PDF (Admin/Manager) |
| GET | /api/payroll/ytd | YTD summary (current user; query: year) |
| GET | /api/payroll/ytd/:employeeId | YTD summary for employee |
| GET | /api/payroll/:id | Get payroll |
| GET | /api/payroll/:id/download | Download salary slip PDF |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/attendance/clock-in | Clock in (body: location?) |
| POST | /api/attendance/clock-out | Clock out |
| GET | /api/attendance | List (employee, from, to, pagination) |
| GET | /api/attendance/:id | Get record |
| POST | /api/attendance/:id/approve | Approve timesheet (Admin/Manager) |

### Reimbursements
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reimbursements | Submit claim (body: amount, description?; optional multipart receipts) |
| GET | /api/reimbursements | List (employee, status, pagination) |
| GET | /api/reimbursements/:id | Get claim |
| PATCH | /api/reimbursements/:id/action | Approve/reject/paid (Admin/Manager; body: action, rejectionReason?) |

### Announcements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/announcements | List (role-filtered by visibleTo) |
| POST | /api/announcements | Create (Admin/Manager) |
| GET | /api/announcements/:id | Get one |
| PATCH | /api/announcements/:id | Update (Admin/Manager) |
| DELETE | /api/announcements/:id | Delete (Admin/Manager) |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/attendance | Attendance report (from, to, employeeId) |
| GET | /api/reports/payroll | Payroll report (year, month?, employeeId) |
| GET | /api/reports/leave | Leave report (from, to, employeeId, status) |

## Authentication

- Send **access token** in header: `Authorization: Bearer <accessToken>`.
- Use **refresh token** (body or header `x-refresh-token`) at `POST /api/auth/refresh` to get new tokens.
- Roles: **ADMIN**, **MANAGER**, **EMPLOYEE**. RBAC enforced via middlewares.

## Frontend Connection

- Set `FRONTEND_URL` in `.env` (e.g. `http://localhost:3000`) for CORS.
- React app can call `http://localhost:5000/api/*` with the access token in the Authorization header.
