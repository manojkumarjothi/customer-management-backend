You are a senior backend architect and Node.js developer.

Build a COMPLETE, PRODUCTION-READY backend for an Employee Management System.
The backend must run on localhost and expose REST APIs for a React frontend.

----------------------------------
TECH STACK (STRICT)
----------------------------------
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication (access + refresh tokens)
- bcrypt for password hashing
- Multer for file uploads
- Nodemailer for email notifications
- PDFKit / Puppeteer for salary slip PDF generation
- dotenv for environment variables
- Express Validator
- CORS enabled
- Winston / Morgan logging

----------------------------------
PROJECT STRUCTURE (MANDATORY)
----------------------------------
backend/
│── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── mail.js
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── utils/
│   ├── seed/
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
└── README.md

----------------------------------
USER ROLES
----------------------------------
- ADMIN
- MANAGER
- EMPLOYEE

Implement strict Role-Based Access Control (RBAC).

----------------------------------
AUTHENTICATION & SECURITY
----------------------------------
- User registration (Admin creates users)
- Login with JWT
- Refresh token flow
- Password hashing (bcrypt)
- Forgot password via email
- Password reset token expiry
- Login audit logs (IP, device, time)
- Session management
- Optional IP restriction middleware
- Account activation/deactivation

----------------------------------
DATABASE MODELS (REQUIRED)
----------------------------------
Create full Mongoose schemas with relations:

1) User
   - name, email, password, role
   - employeeId
   - department, designation
   - isActive
   - lastLogin

2) EmployeeProfile
   - personal info
   - emergency contacts
   - documents
   - skills
   - qualifications
   - profile completion %

3) Task
   - title, description
   - assignedTo (User)
   - assignedBy
   - priority (High/Medium/Low)
   - status (ToDo/InProgress/Done)
   - deadline
   - project
   - comments
   - attachments
   - progress %

4) Project
   - name
   - department
   - startDate, endDate
   - dependencies
   - Gantt metadata

5) Leave
   - employee
   - leaveType
   - fromDate, toDate
   - reason
   - status (Pending/Approved/Rejected)
   - approvedBy
   - conflictDetected

6) Payroll
   - employee
   - basicSalary
   - allowances
   - deductions
   - netSalary
   - month, year
   - PDF path

7) Attendance
   - employee
   - clockIn
   - clockOut
   - location/IP
   - overtime

8) Reimbursement
   - employee
   - amount
   - receipts
   - status

9) Announcement
   - title
   - message
   - visibleTo
   - createdBy

10) AuditLog
   - action
   - performedBy
   - target
   - timestamp

----------------------------------
API MODULES (FULL CRUD)
----------------------------------
Implement REST APIs for:

AUTH
- POST /auth/login
- POST /auth/refresh
- POST /auth/forgot-password
- POST /auth/reset-password

USERS & EMPLOYEES
- Create / update / deactivate employee
- Role assignment
- Employee directory search

TASK MANAGEMENT
- Create, assign, update, delete tasks
- Bulk operations
- Drag-drop status update support
- Comments & attachments

PROJECT MANAGEMENT
- Project CRUD
- Gantt data endpoints

LEAVE MANAGEMENT
- Apply leave
- Approve/reject leave
- Conflict detection logic
- Leave balance calculation

PAYROLL
- Generate salary
- Generate & download PDF
- Year-to-date summary

ATTENDANCE & SHIFTS
- Clock-in / clock-out
- Overtime calculation
- Timesheet approval

REIMBURSEMENTS
- Submit claim
- Approve/reject
- Payment status

ANNOUNCEMENTS
- Create & broadcast
- Role-based visibility

REPORTING
- Attendance report
- Payroll report
- Leave report
- Export-ready APIs

----------------------------------
MIDDLEWARES
----------------------------------
- Auth middleware
- Role check middleware
- Error handler
- Request validation
- File upload handler
- Audit logger

----------------------------------
UTILITIES
----------------------------------
- Email service
- PDF generator
- Date helpers
- Pagination & filtering helper

----------------------------------
SEED DATA
----------------------------------
- Admin user
- HR user
- Sample employees
- Sample tasks & leaves

----------------------------------
REQUIREMENTS
----------------------------------
- Clean & modular code
- Proper HTTP status codes
- Centralized error handling
- Fully commented
- No pseudo-code
- Ready to connect to frontend

----------------------------------
FINAL OUTPUT
----------------------------------
- Complete backend code
- Sample .env
- README with localhost run instructions
- API endpoint list

Start implementation step-by-step.
Begin with database connection and authentication module.
