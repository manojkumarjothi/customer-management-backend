# Employee Management System – API Endpoints (Payload & Response)

**Base URL:** `http://localhost:5000`  
**API Prefix:** `/api`  
**Auth:** Send access token in header: `Authorization: Bearer <accessToken>`

---

## Common Response Shapes

**Success (single resource):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Success (list with pagination):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OK",
  "timestamp": "2025-02-02T10:00:00.000Z"
}
```

---

## Auth

### POST `/api/auth/login`

**Auth:** No  
**Payload (JSON):**
```json
{
  "email": "admin@company.com",
  "password": "Admin@123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@company.com",
    "role": "ADMIN",
    "employeeId": "EMP001",
    "department": "IT",
    "designation": "System Administrator",
    "isActive": true,
    "lastLogin": "2025-02-02T10:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3d4e5f6...",
  "expiresIn": "2025-02-02T10:15:00.000Z"
}
```

---

### POST `/api/auth/refresh`

**Auth:** No (use refresh token in body or header)  
**Payload (JSON):**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```
Or header: `x-refresh-token: <refreshToken>`

**Response:** `200 OK`
```json
{
  "success": true,
  "user": { "_id": "...", "name": "...", "email": "...", "role": "...", ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "new_refresh_token...",
  "expiresIn": "2025-02-02T10:15:00.000Z"
}
```

---

### POST `/api/auth/forgot-password`

**Auth:** No  
**Payload (JSON):**
```json
{
  "email": "user@company.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "If the email exists, a reset link will be sent."
}
```

---

### POST `/api/auth/reset-password`

**Auth:** No  
**Payload (JSON):**
```json
{
  "token": "reset_token_from_email_link",
  "password": "NewSecurePass@123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successful."
}
```

---

### POST `/api/auth/logout`

**Auth:** No (optional: send refresh token to revoke)  
**Payload (JSON):**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```
Or header: `x-refresh-token: <refreshToken>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out."
}
```

---

## Users & Employees

All user endpoints require **Auth** (Bearer token). Role restrictions noted per endpoint.

---

### GET `/api/users`

**Auth:** Yes  
**Roles:** Any  
**Query:**

| Param   | Type   | Optional | Description        |
|---------|--------|----------|--------------------|
| page    | number | Yes      | Default: 1         |
| limit   | number | Yes      | Default: 20, max 100 |
| search  | string | Yes      | Search name, email, employeeId, department, designation |
| role    | string | Yes      | ADMIN \| MANAGER \| EMPLOYEE |
| active  | string | Yes      | "false" to include inactive |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "EMPLOYEE",
      "employeeId": "EMP003",
      "department": "Engineering",
      "designation": "Software Engineer",
      "isActive": true,
      "lastLogin": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### POST `/api/users`

**Auth:** Yes | **Roles:** ADMIN  
**Payload (JSON):**
```json
{
  "name": "New Employee",
  "email": "new@company.com",
  "password": "TempPass@123",
  "role": "EMPLOYEE",
  "employeeId": "EMP005",
  "department": "Engineering",
  "designation": "Developer",
  "sendEmail": false
}
```
| Field      | Required | Notes                          |
|------------|----------|--------------------------------|
| name       | Yes      |                                |
| email      | Yes      | Unique                         |
| password   | No       | Omit to auto-generate          |
| role       | No       | ADMIN \| MANAGER \| EMPLOYEE, default EMPLOYEE |
| employeeId | No       |                                |
| department | No       |                                |
| designation| No       |                                |
| sendEmail  | No       | Send welcome email with temp password |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "New Employee",
    "email": "new@company.com",
    "role": "EMPLOYEE",
    "employeeId": "EMP005",
    "department": "Engineering",
    "designation": "Developer",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/api/users/:id`

**Auth:** Yes | **Roles:** Any  
**Params:** `id` – User MongoDB ObjectId

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "EMPLOYEE",
    "employeeId": "EMP003",
    "department": "Engineering",
    "designation": "Software Engineer",
    "isActive": true,
    "lastLogin": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### PATCH `/api/users/:id`

**Auth:** Yes | **Roles:** Admin/Manager for role & isActive; self for other fields  
**Params:** `id` – User ObjectId  
**Payload (JSON):** All optional.
```json
{
  "name": "John Doe Updated",
  "email": "john.new@company.com",
  "role": "MANAGER",
  "employeeId": "EMP003",
  "department": "Engineering",
  "designation": "Senior Engineer",
  "isActive": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe Updated",
    "email": "john.new@company.com",
    "role": "MANAGER",
    "employeeId": "EMP003",
    "department": "Engineering",
    "designation": "Senior Engineer",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### POST `/api/users/:id/deactivate`

**Auth:** Yes | **Roles:** ADMIN, MANAGER  
**Params:** `id` – User ObjectId  
**Payload:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isActive": false
  }
}
```

---

### GET `/api/users/:userId/profile`

**Auth:** Yes | **Roles:** Any (own profile or Admin/Manager for others)  
**Params:** `userId` – User ObjectId

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@company.com",
      "employeeId": "EMP003",
      "department": "Engineering",
      "designation": "Software Engineer"
    },
    "dateOfBirth": null,
    "gender": null,
    "phone": null,
    "address": null,
    "bloodGroup": null,
    "maritalStatus": null,
    "nationality": null,
    "emergencyContacts": [],
    "documents": [],
    "skills": [],
    "qualifications": [],
    "profileCompletionPercent": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### PATCH `/api/users/:userId/profile`

**Auth:** Yes | **Roles:** Self or ADMIN/MANAGER  
**Params:** `userId` – User ObjectId  
**Payload (JSON):** All optional.
```json
{
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "phone": "+919876543210",
  "address": "City, Country",
  "bloodGroup": "O+",
  "maritalStatus": "Single",
  "nationality": "Indian",
  "emergencyContacts": [
    { "name": "Jane", "relationship": "Spouse", "phone": "+919876543211" }
  ],
  "documents": [
    { "type": "ID", "url": "/uploads/docs/1.pdf", "name": "id.pdf" }
  ],
  "skills": ["JavaScript", "Node.js"],
  "qualifications": [
    { "institution": "ABC University", "degree": "B.Tech", "year": 2012 }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "user": { ... },
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "gender": "Male",
    "phone": "+919876543210",
    "address": "City, Country",
    "emergencyContacts": [...],
    "documents": [...],
    "skills": ["JavaScript", "Node.js"],
    "qualifications": [...],
    "profileCompletionPercent": 75,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Tasks

All task endpoints require **Auth**. Employees see only tasks assigned to them.

---

### GET `/api/tasks`

**Auth:** Yes  
**Query:**

| Param      | Type   | Optional | Description              |
|------------|--------|----------|--------------------------|
| page       | number | Yes      | Default: 1               |
| limit      | number | Yes      | Default: 20, max 100     |
| sort       | string | Yes      | e.g. "-createdAt,name"   |
| assignedTo | string | Yes      | User ObjectId            |
| project    | string | Yes      | Project ObjectId         |
| status     | string | Yes      | ToDo \| InProgress \| Done |
| priority   | string | Yes      | High \| Medium \| Low    |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439031",
      "title": "Setup auth module",
      "description": "Implement JWT login and refresh",
      "assignedTo": { "_id": "...", "name": "John Doe", "email": "john@company.com" },
      "assignedBy": { "_id": "...", "name": "HR Manager", "email": "hr@company.com" },
      "priority": "High",
      "status": "Done",
      "deadline": "2025-02-15T00:00:00.000Z",
      "project": { "_id": "...", "name": "Employee Portal" },
      "comments": [],
      "attachments": [],
      "progressPercent": 100,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { "total": 5, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### POST `/api/tasks`

**Auth:** Yes  
**Payload (JSON):**
```json
{
  "title": "New task",
  "description": "Task description",
  "assignedTo": "507f1f77bcf86cd799439011",
  "priority": "Medium",
  "deadline": "2025-03-01T00:00:00.000Z",
  "project": "507f1f77bcf86cd799439040"
}
```
| Field       | Required | Notes                    |
|-------------|----------|--------------------------|
| title       | Yes      |                          |
| description | No       |                          |
| assignedTo  | No       | User ObjectId            |
| priority    | No       | High \| Medium \| Low     |
| deadline    | No       | ISO 8601                  |
| project     | No       | Project ObjectId         |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439031",
    "title": "New task",
    "description": "Task description",
    "assignedTo": { "_id": "...", "name": "John Doe", "email": "..." },
    "assignedBy": { "_id": "...", "name": "...", "email": "..." },
    "priority": "Medium",
    "status": "ToDo",
    "deadline": "2025-03-01T00:00:00.000Z",
    "project": { "_id": "...", "name": "Employee Portal" },
    "comments": [],
    "attachments": [],
    "progressPercent": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/api/tasks/:id`

**Auth:** Yes  
**Params:** `id` – Task ObjectId

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439031",
    "title": "Setup auth module",
    "description": "...",
    "assignedTo": { "_id": "...", "name": "John Doe", "email": "..." },
    "assignedBy": { "_id": "...", "name": "HR Manager", "email": "..." },
    "priority": "High",
    "status": "Done",
    "deadline": "...",
    "project": { "_id": "...", "name": "Employee Portal" },
    "comments": [
      { "user": { "_id": "...", "name": "...", "email": "..." }, "text": "Done", "createdAt": "..." }
    ],
    "attachments": [{ "name": "file.pdf", "url": "/uploads/attachments/...", "uploadedAt": "..." }],
    "progressPercent": 100,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### PATCH `/api/tasks/:id`

**Auth:** Yes  
**Params:** `id` – Task ObjectId  
**Payload (JSON):** All optional.
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "assignedTo": "507f1f77bcf86cd799439011",
  "priority": "High",
  "status": "InProgress",
  "deadline": "2025-03-15T00:00:00.000Z",
  "project": "507f1f77bcf86cd799439040",
  "progressPercent": 50
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439031",
    "title": "Updated title",
    "description": "Updated description",
    "assignedTo": { ... },
    "assignedBy": { ... },
    "priority": "High",
    "status": "InProgress",
    "deadline": "2025-03-15T00:00:00.000Z",
    "project": { ... },
    "comments": [],
    "attachments": [],
    "progressPercent": 50,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### PATCH `/api/tasks/:id/status`

**Auth:** Yes  
**Params:** `id` – Task ObjectId  
**Payload (JSON):**
```json
{
  "status": "InProgress"
}
```
`status`: `ToDo` | `InProgress` | `Done`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439031",
    "status": "InProgress"
  }
}
```

---

### DELETE `/api/tasks/:id`

**Auth:** Yes  
**Params:** `id` – Task ObjectId  
**Payload:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439031",
    "deleted": true
  }
}
```

---

### POST `/api/tasks/bulk/status`

**Auth:** Yes  
**Payload (JSON):**
```json
{
  "taskIds": ["507f1f77bcf86cd799439031", "507f1f77bcf86cd799439032"],
  "status": "Done"
}
```
`status`: `ToDo` | `InProgress` | `Done`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "modified": 2,
    "status": "Done"
  }
}
```

---

### POST `/api/tasks/:id/comments`

**Auth:** Yes  
**Params:** `id` – Task ObjectId  
**Payload (JSON):**
```json
{
  "text": "Comment text here"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": [
    {
      "user": { "_id": "...", "name": "John Doe", "email": "..." },
      "text": "Comment text here",
      "createdAt": "2025-02-02T10:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/tasks/:id/attachments`

**Auth:** Yes  
**Params:** `id` – Task ObjectId  
**Content-Type:** `multipart/form-data`  
**Body:** Field name `files`; one or more files (max 5, 10MB each).

**Response:** `201 Created`
```json
{
  "success": true,
  "data": [
    { "name": "doc.pdf", "url": "/uploads/attachments/xxx.pdf", "uploadedAt": "..." }
  ]
}
```

---

## Projects

All project endpoints require **Auth**.

---

### GET `/api/projects`

**Auth:** Yes  
**Query:**

| Param | Type   | Optional | Description     |
|-------|--------|----------|-----------------|
| page  | number | Yes      | Default: 1      |
| limit | number | Yes      | Default: 20     |
| search| string | Yes      | name, department |
| active| string | Yes      | "false" for inactive |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "name": "Employee Portal",
      "description": null,
      "department": "Engineering",
      "startDate": "2025-02-01T00:00:00.000Z",
      "endDate": "2025-04-30T00:00:00.000Z",
      "dependencies": [],
      "ganttMetadata": null,
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### POST `/api/projects`

**Auth:** Yes | **Roles:** ADMIN, MANAGER  
**Payload (JSON):**
```json
{
  "name": "New Project",
  "description": "Project description",
  "department": "Engineering",
  "startDate": "2025-02-01",
  "endDate": "2025-06-30",
  "dependencies": ["507f1f77bcf86cd799439041"],
  "ganttMetadata": { "custom": "data" }
}
```
| Field        | Required | Notes          |
|--------------|----------|----------------|
| name         | Yes      |                |
| description  | No       |                |
| department   | No       |                |
| startDate    | No       | ISO 8601       |
| endDate      | No       | ISO 8601       |
| dependencies | No       | Array of Project ObjectIds |
| ganttMetadata| No       | Any object     |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "name": "New Project",
    "description": "Project description",
    "department": "Engineering",
    "startDate": "2025-02-01T00:00:00.000Z",
    "endDate": "2025-06-30T00:00:00.000Z",
    "dependencies": ["507f1f77bcf86cd799439041"],
    "ganttMetadata": { "custom": "data" },
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/api/projects/:id`

**Auth:** Yes  
**Params:** `id` – Project ObjectId

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "name": "Employee Portal",
    "description": null,
    "department": "Engineering",
    "startDate": "...",
    "endDate": "...",
    "dependencies": [{ "_id": "...", "name": "...", "startDate": "...", "endDate": "..." }],
    "ganttMetadata": null,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/api/projects/:id/gantt`

**Auth:** Yes  
**Params:** `id` – Project ObjectId

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "name": "Employee Portal",
    "startDate": "...",
    "endDate": "...",
    "ganttMetadata": null,
    "dependencies": [{ "_id": "...", "name": "...", "startDate": "...", "endDate": "..." }]
  }
}
```

---

### PATCH `/api/projects/:id`

**Auth:** Yes  
**Params:** `id` – Project ObjectId  
**Payload (JSON):** All optional.
```json
{
  "name": "Updated name",
  "description": "Updated description",
  "department": "Engineering",
  "startDate": "2025-02-01",
  "endDate": "2025-07-31",
  "dependencies": [],
  "ganttMetadata": {},
  "isActive": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "name": "Updated name",
    "description": "Updated description",
    "department": "Engineering",
    "startDate": "...",
    "endDate": "...",
    "dependencies": [],
    "ganttMetadata": {},
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### DELETE `/api/projects/:id`

**Auth:** Yes  
**Params:** `id` – Project ObjectId  
**Payload:** None  

Soft delete (sets `isActive: false`).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "isActive": false
  }
}
```

---

## Leave

All leave endpoints require **Auth**. Employees see only their own leaves unless Admin/Manager.

---

### POST `/api/leaves`

**Auth:** Yes  
**Payload (JSON):**
```json
{
  "leaveType": "Casual",
  "fromDate": "2025-02-10",
  "toDate": "2025-02-12",
  "reason": "Personal",
  "employeeId": "507f1f77bcf86cd799439011"
}
```
| Field      | Required | Notes                                   |
|------------|----------|----------------------------------------|
| leaveType  | Yes      | Sick, Casual, Earned, Maternity, Paternity, Unpaid, Other |
| fromDate   | Yes      | ISO 8601                               |
| toDate     | Yes      | ISO 8601, must be >= fromDate          |
| reason     | No       |                                        |
| employeeId | No       | Admin/Manager only; default: current user |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439051",
    "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
    "leaveType": "Casual",
    "fromDate": "2025-02-10T00:00:00.000Z",
    "toDate": "2025-02-12T00:00:00.000Z",
    "reason": "Personal",
    "status": "Pending",
    "conflictDetected": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/api/leaves`

**Auth:** Yes  
**Query:**

| Param    | Type   | Optional | Description        |
|----------|--------|----------|--------------------|
| page     | number | Yes      | Default: 1         |
| limit    | number | Yes      | Default: 20        |
| status   | string | Yes      | Pending, Approved, Rejected |
| employee | string | Yes      | User ObjectId      |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439051",
      "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
      "leaveType": "Casual",
      "fromDate": "2025-02-10T00:00:00.000Z",
      "toDate": "2025-02-12T00:00:00.000Z",
      "reason": "Personal",
      "status": "Pending",
      "approvedBy": null,
      "approvedAt": null,
      "rejectionReason": null,
      "conflictDetected": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### GET `/api/leaves/balance`

**Auth:** Yes  
**Query:** `year` (optional, default: current year)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "year": 2025,
    "totalDaysUsed": 3,
    "casualRemaining": 9,
    "earnedRemaining": 21
  }
}
```

---

### GET `/api/leaves/balance/:userId`

**Auth:** Yes | **Roles:** Admin/Manager or self  
**Params:** `userId` – User ObjectId  
**Query:** `year` (optional)

**Response:** Same shape as `GET /api/leaves/balance`.

---

### GET `/api/leaves/:id`

**Auth:** Yes  
**Params:** `id` – Leave ObjectId

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439051",
    "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
    "leaveType": "Casual",
    "fromDate": "2025-02-10T00:00:00.000Z",
    "toDate": "2025-02-12T00:00:00.000Z",
    "reason": "Personal",
    "status": "Pending",
    "approvedBy": null,
    "approvedAt": null,
    "rejectionReason": null,
    "conflictDetected": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### PATCH `/api/leaves/:id/approve`

**Auth:** Yes | **Roles:** ADMIN, MANAGER  
**Params:** `id` – Leave ObjectId  
**Payload (JSON):**
```json
{
  "action": "approve"
}
```
or
```json
{
  "action": "reject",
  "rejectionReason": "Not enough balance"
}
```
`action`: `approve` | `reject`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439051",
    "employee": { ... },
    "leaveType": "Casual",
    "fromDate": "...",
    "toDate": "...",
    "reason": "Personal",
    "status": "Approved",
    "approvedBy": { "_id": "...", "name": "HR Manager", "email": "..." },
    "approvedAt": "2025-02-02T10:00:00.000Z",
    "rejectionReason": null,
    "conflictDetected": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Payroll

All payroll endpoints require **Auth**. Employees see only their own payroll unless Admin/Manager.

---

### GET `/api/payroll`

**Auth:** Yes  
**Query:**

| Param    | Type   | Optional | Description |
|----------|--------|----------|-------------|
| page     | number | Yes      | Default: 1   |
| limit    | number | Yes      | Default: 20  |
| employee | string | Yes      | User ObjectId |
| month    | number | Yes      | 1–12        |
| year     | number | Yes      | e.g. 2025   |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439061",
      "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
      "basicSalary": 50000,
      "allowances": { "HRA": 10000, "Transport": 2000 },
      "deductions": { "Tax": 5000, "PF": 3000 },
      "grossSalary": 62000,
      "netSalary": 54000,
      "month": 1,
      "year": 2025,
      "pdfPath": "uploads/payroll/salary-xxx-2025-01.pdf",
      "currency": "INR",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### POST `/api/payroll/generate`

**Auth:** Yes | **Roles:** ADMIN, MANAGER  
**Payload (JSON):**
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "month": 1,
  "year": 2025,
  "basicSalary": 50000,
  "allowances": { "HRA": 10000, "Transport": 2000 },
  "deductions": { "Tax": 5000, "PF": 3000 }
}
```
| Field       | Required | Notes        |
|-------------|----------|-------------|
| employeeId  | Yes      | User ObjectId |
| month       | Yes      | 1–12        |
| year        | Yes      |             |
| basicSalary | Yes      | >= 0        |
| allowances  | No       | Object      |
| deductions  | No       | Object      |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439061",
    "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
    "basicSalary": 50000,
    "allowances": { "HRA": 10000, "Transport": 2000 },
    "deductions": { "Tax": 5000, "PF": 3000 },
    "grossSalary": 62000,
    "netSalary": 54000,
    "month": 1,
    "year": 2025,
    "pdfPath": "uploads/payroll/salary-xxx-2025-01.pdf",
    "currency": "INR",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/api/payroll/ytd`

**Auth:** Yes  
**Query:** `year` (optional, default: current year)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "year": 2025,
    "totalNet": 54000,
    "totalGross": 62000,
    "monthsCount": 1
  }
}
```

---

### GET `/api/payroll/ytd/:employeeId`

**Auth:** Yes | **Roles:** Admin/Manager or self  
**Params:** `employeeId` – User ObjectId  
**Query:** `year` (optional)

**Response:** Same shape as `GET /api/payroll/ytd`.

---

### GET `/api/payroll/:id`

**Auth:** Yes  
**Params:** `id` – Payroll ObjectId

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439061",
    "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003", "department": "...", "designation": "..." },
    "basicSalary": 50000,
    "allowances": { "HRA": 10000, "Transport": 2000 },
    "deductions": { "Tax": 5000, "PF": 3000 },
    "grossSalary": 62000,
    "netSalary": 54000,
    "month": 1,
    "year": 2025,
    "pdfPath": "uploads/payroll/salary-xxx-2025-01.pdf",
    "currency": "INR",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/api/payroll/:id/download`

**Auth:** Yes  
**Params:** `id` – Payroll ObjectId  
**Response:** `200 OK` – Binary PDF file (Content-Disposition: attachment).

---

## Attendance

All attendance endpoints require **Auth**.

---

### POST `/api/attendance/clock-in`

**Auth:** Yes  
**Payload (JSON):**
```json
{
  "location": "Office"
}
```
`location` optional.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439071",
    "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
    "date": "2025-02-02T00:00:00.000Z",
    "clockIn": "2025-02-02T09:00:00.000Z",
    "clockOut": null,
    "location": "Office",
    "ip": "::1",
    "overtimeMinutes": 0,
    "status": "Present",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### POST `/api/attendance/clock-out`

**Auth:** Yes  
**Payload:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439071",
    "employee": { ... },
    "date": "2025-02-02T00:00:00.000Z",
    "clockIn": "2025-02-02T09:00:00.000Z",
    "clockOut": "2025-02-02T18:30:00.000Z",
    "location": "Office",
    "ip": "::1",
    "overtimeMinutes": 90,
    "status": "Present",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/api/attendance`

**Auth:** Yes  
**Query:**

| Param    | Type   | Optional | Description |
|----------|--------|----------|-------------|
| page     | number | Yes      | Default: 1   |
| limit    | number | Yes      | Default: 20  |
| employee | string | Yes      | User ObjectId |
| from     | string | Yes      | ISO 8601     |
| to       | string | Yes      | ISO 8601     |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439071",
      "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
      "date": "2025-02-02T00:00:00.000Z",
      "clockIn": "2025-02-02T09:00:00.000Z",
      "clockOut": "2025-02-02T18:30:00.000Z",
      "location": "Office",
      "ip": "::1",
      "overtimeMinutes": 90,
      "status": "Present",
      "approvedBy": null,
      "notes": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### GET `/api/attendance/:id`

**Auth:** Yes  
**Params:** `id` – Attendance ObjectId

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439071",
    "employee": { ... },
    "date": "2025-02-02T00:00:00.000Z",
    "clockIn": "...",
    "clockOut": "...",
    "location": "Office",
    "ip": "::1",
    "overtimeMinutes": 90,
    "status": "Present",
    "approvedBy": null,
    "notes": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### POST `/api/attendance/:id/approve`

**Auth:** Yes | **Roles:** ADMIN, MANAGER  
**Params:** `id` – Attendance ObjectId  
**Payload:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439071",
    "employee": { ... },
    "date": "...",
    "clockIn": "...",
    "clockOut": "...",
    "overtimeMinutes": 90,
    "status": "Present",
    "approvedBy": { "_id": "...", "name": "HR Manager", "email": "..." },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Reimbursements

All reimbursement endpoints require **Auth**.

---

### POST `/api/reimbursements`

**Auth:** Yes  
**Content-Type:** `application/json` or `multipart/form-data` (for receipts).  
**Payload (JSON):**
```json
{
  "amount": 5000,
  "description": "Travel expense"
}
```
**Payload (multipart):** Same fields + file field `receipts` (multiple files, max 5, 10MB each).

| Field       | Required | Notes        |
|-------------|----------|-------------|
| amount      | Yes      | >= 0        |
| description | No       |             |
| receipts    | No       | Files or array of { name, url } |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439081",
    "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
    "amount": 5000,
    "description": "Travel expense",
    "receipts": [{ "name": "receipt.pdf", "url": "/uploads/receipts/xxx.pdf", "amount": null, "uploadedAt": "..." }],
    "status": "Pending",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/api/reimbursements`

**Auth:** Yes  
**Query:**

| Param    | Type   | Optional | Description        |
|----------|--------|----------|--------------------|
| page     | number | Yes      | Default: 1         |
| limit    | number | Yes      | Default: 20        |
| status   | string | Yes      | Pending, Approved, Rejected, Paid |
| employee | string | Yes      | User ObjectId     |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439081",
      "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
      "amount": 5000,
      "description": "Travel expense",
      "receipts": [...],
      "status": "Pending",
      "approvedBy": null,
      "approvedAt": null,
      "paidAt": null,
      "rejectionReason": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### GET `/api/reimbursements/:id`

**Auth:** Yes  
**Params:** `id` – Reimbursement ObjectId

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439081",
    "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
    "amount": 5000,
    "description": "Travel expense",
    "receipts": [...],
    "status": "Pending",
    "approvedBy": null,
    "approvedAt": null,
    "paidAt": null,
    "rejectionReason": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### PATCH `/api/reimbursements/:id/action`

**Auth:** Yes | **Roles:** ADMIN, MANAGER  
**Params:** `id` – Reimbursement ObjectId  
**Payload (JSON):**
```json
{
  "action": "approve"
}
```
or
```json
{
  "action": "reject",
  "rejectionReason": "Missing receipts"
}
```
or
```json
{
  "action": "paid"
}
```
`action`: `approve` | `reject` | `paid`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439081",
    "employee": { ... },
    "amount": 5000,
    "description": "Travel expense",
    "receipts": [...],
    "status": "Approved",
    "approvedBy": { "_id": "...", "name": "HR Manager", "email": "..." },
    "approvedAt": "2025-02-02T10:00:00.000Z",
    "paidAt": null,
    "rejectionReason": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Announcements

All announcement endpoints require **Auth**. List/get filter by `visibleTo` (role or "ALL").

---

### GET `/api/announcements`

**Auth:** Yes  
**Query:**

| Param   | Type   | Optional | Description      |
|---------|--------|----------|------------------|
| page    | number | Yes      | Default: 1       |
| limit   | number | Yes      | Default: 20      |
| pinned  | string | Yes      | "true" / "false" |
| expired | string | Yes      | "false" = only non-expired |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439091",
      "title": "Holiday notice",
      "message": "Office closed on 26 Jan.",
      "visibleTo": ["ALL"],
      "createdBy": { "_id": "...", "name": "Admin User", "email": "admin@company.com" },
      "isPinned": true,
      "expiresAt": "2025-02-28T00:00:00.000Z",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### POST `/api/announcements`

**Auth:** Yes | **Roles:** ADMIN, MANAGER  
**Payload (JSON):**
```json
{
  "title": "Holiday notice",
  "message": "Office closed on 26 Jan.",
  "visibleTo": ["ALL"],
  "isPinned": true,
  "expiresAt": "2025-02-28T00:00:00.000Z"
}
```
| Field     | Required | Notes                          |
|-----------|----------|--------------------------------|
| title     | Yes      |                                |
| message   | Yes      |                                |
| visibleTo | No       | Array of "ADMIN", "MANAGER", "EMPLOYEE", "ALL"; default ["ALL"] |
| isPinned  | No       | boolean, default false         |
| expiresAt | No      | ISO 8601                       |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439091",
    "title": "Holiday notice",
    "message": "Office closed on 26 Jan.",
    "visibleTo": ["ALL"],
    "createdBy": { "_id": "...", "name": "Admin User", "email": "admin@company.com" },
    "isPinned": true,
    "expiresAt": "2025-02-28T00:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/api/announcements/:id`

**Auth:** Yes  
**Params:** `id` – Announcement ObjectId

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439091",
    "title": "Holiday notice",
    "message": "Office closed on 26 Jan.",
    "visibleTo": ["ALL"],
    "createdBy": { "_id": "...", "name": "Admin User", "email": "admin@company.com" },
    "isPinned": true,
    "expiresAt": "2025-02-28T00:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### PATCH `/api/announcements/:id`

**Auth:** Yes | **Roles:** ADMIN, MANAGER  
**Params:** `id` – Announcement ObjectId  
**Payload (JSON):** All optional.
```json
{
  "title": "Updated title",
  "message": "Updated message",
  "visibleTo": ["ADMIN", "MANAGER", "EMPLOYEE"],
  "isPinned": false,
  "expiresAt": "2025-03-31T00:00:00.000Z"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439091",
    "title": "Updated title",
    "message": "Updated message",
    "visibleTo": ["ADMIN", "MANAGER", "EMPLOYEE"],
    "createdBy": { ... },
    "isPinned": false,
    "expiresAt": "2025-03-31T00:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### DELETE `/api/announcements/:id`

**Auth:** Yes | **Roles:** ADMIN, MANAGER  
**Params:** `id` – Announcement ObjectId  
**Payload:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439091",
    "deleted": true
  }
}
```

---

## Reports

All report endpoints require **Auth**. Employees see only their own data.

---

### GET `/api/reports/attendance`

**Auth:** Yes  
**Query:**

| Param      | Type   | Optional | Description   |
|------------|--------|----------|---------------|
| from       | string | Yes      | ISO 8601      |
| to         | string | Yes      | ISO 8601      |
| employeeId | string | Yes      | User ObjectId |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRecords": 22,
      "present": 20,
      "withOvertime": 5
    },
    "records": [
      {
        "_id": "...",
        "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
        "date": "2025-02-02T00:00:00.000Z",
        "clockIn": "...",
        "clockOut": "...",
        "overtimeMinutes": 90,
        "status": "Present",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

---

### GET `/api/reports/payroll`

**Auth:** Yes  
**Query:**

| Param      | Type   | Optional | Description   |
|------------|--------|----------|---------------|
| year       | number | Yes      | Default: current year |
| month      | number | Yes      | 1–12          |
| employeeId | string | Yes      | User ObjectId |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "year": 2025,
    "month": null,
    "summary": {
      "totalNet": 108000,
      "totalGross": 124000,
      "count": 2
    },
    "records": [
      {
        "_id": "...",
        "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
        "basicSalary": 50000,
        "allowances": { "HRA": 10000, "Transport": 2000 },
        "deductions": { "Tax": 5000, "PF": 3000 },
        "grossSalary": 62000,
        "netSalary": 54000,
        "month": 1,
        "year": 2025,
        "pdfPath": "...",
        "currency": "INR",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

---

### GET `/api/reports/leave`

**Auth:** Yes  
**Query:**

| Param      | Type   | Optional | Description   |
|------------|--------|----------|---------------|
| from       | string | Yes      | ISO 8601      |
| to         | string | Yes      | ISO 8601      |
| employeeId | string | Yes      | User ObjectId |
| status     | string | Yes      | Pending, Approved, Rejected |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "summary": {
      "Pending": 2,
      "Approved": 5,
      "Rejected": 0
    },
    "records": [
      {
        "_id": "...",
        "employee": { "_id": "...", "name": "John Doe", "email": "...", "employeeId": "EMP003" },
        "leaveType": "Casual",
        "fromDate": "2025-02-10T00:00:00.000Z",
        "toDate": "2025-02-12T00:00:00.000Z",
        "reason": "Personal",
        "status": "Approved",
        "approvedBy": { "_id": "...", "name": "HR Manager", "email": "..." },
        "approvedAt": "...",
        "conflictDetected": false,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

---

## HTTP Status Codes

| Code | Usage |
|------|--------|
| 200 | OK (GET, PATCH, DELETE success) |
| 201 | Created (POST success) |
| 400 | Bad Request (validation, invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role or deactivated account) |
| 404 | Not Found (resource not found) |
| 409 | Conflict (e.g. duplicate payroll for month/year) |
| 500 | Internal Server Error |

---

## Authentication Header

For all protected routes (except Auth endpoints):

```
Authorization: Bearer <accessToken>
```

Optional for refresh/logout:

```
x-refresh-token: <refreshToken>
```
