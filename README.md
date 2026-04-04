# Finance Dashboard Backend

A RESTful backend for a finance dashboard system with role-based access control. Supports user management, financial record CRUD with filtering, and dashboard analytics.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Tokens) + bcrypt
- **Validation:** Joi
- **Docs:** Swagger UI (OpenAPI 3.0)

## Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Clone and install

```bash
git clone <repo-url>
cd zorvyn
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Set up database

```bash
psql -U postgres -c "CREATE DATABASE finance_db;"
psql -U postgres -d finance_db -f src/db/schema.sql
psql -U postgres -d finance_db -f src/db/seed.sql
```

### 4. Start the server

```bash
npm run dev    # development (auto-restart on changes)
npm start      # production
```

### 5. Open API docs

Visit **http://localhost:3000/api-docs** for interactive Swagger documentation.

## Seed Users

| Email | Password | Role |
|-------|----------|------|
| admin@finance.com | admin123 | Admin |
| analyst@finance.com | admin123 | Analyst |
| viewer@finance.com | admin123 | Viewer |

## API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login, returns JWT token | Public |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create a user |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Financial Records
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/records` | Create a record | Admin |
| GET | `/api/records` | List records (filterable) | Analyst, Admin |
| GET | `/api/records/:id` | Get record by ID | Analyst, Admin |
| PATCH | `/api/records/:id` | Update a record | Admin |
| DELETE | `/api/records/:id` | Delete a record | Admin |

**Filters for GET /api/records:**
- `type` — income / expense
- `category` — category name
- `startDate` & `endDate` — date range (YYYY-MM-DD)
- `minAmount` & `maxAmount` — amount range

Example: `GET /api/records?type=income&startDate=2025-01-01&endDate=2025-03-31`

### Dashboard (All authenticated users)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Total income, expenses, net balance |
| GET | `/api/dashboard/category-totals` | Totals grouped by category |
| GET | `/api/dashboard/recent-activity?limit=5` | Last N transactions |
| GET | `/api/dashboard/trends` | Monthly income vs expense |

## Role Permissions

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View dashboard summaries | Yes | Yes | Yes |
| View financial records | No | Yes | Yes |
| Filter/search records | No | Yes | Yes |
| Create/update/delete records | No | No | Yes |
| Manage users | No | No | Yes |

## Project Structure

```
src/
├── config/
│   ├── db.js              # PostgreSQL connection pool
│   └── swagger.js         # Swagger/OpenAPI configuration
├── middleware/
│   ├── auth.js            # JWT token verification
│   ├── rbac.js            # Role-based access control
│   └── errorHandler.js    # Global error handler
├── validators/
│   ├── userValidator.js   # User input validation (Joi)
│   └── recordValidator.js # Record input validation (Joi)
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   ├── userRoutes.js      # User CRUD endpoints
│   ├── recordRoutes.js    # Financial record endpoints
│   └── dashboardRoutes.js # Dashboard analytics endpoints
├── controllers/
│   ├── authController.js  # Login logic
│   ├── userController.js  # User request handlers
│   ├── recordController.js # Record request handlers
│   └── dashboardController.js # Dashboard request handlers
├── services/
│   ├── userService.js     # User business logic & queries
│   ├── recordService.js   # Record business logic & queries
│   └── dashboardService.js # Aggregation queries
├── db/
│   ├── schema.sql         # Table creation SQL
│   └── seed.sql           # Sample data
└── app.js                 # Express app setup

server.js                  # Entry point
```

## Architecture

```
Request → Route → Middleware (auth → RBAC → validation) → Controller → Service → PostgreSQL
```

- **Routes** — URL-to-handler mapping only
- **Middleware** — reusable auth, role checks, and input validation
- **Controllers** — thin layer that reads requests and sends responses
- **Services** — all business logic and database queries (testable independently)

## Response Format

**Success:**
```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Field-level errors (validation)"]
}
```

## Assumptions

1. Single-tenant system — all users belong to the same organization
2. An initial admin user is seeded into the database
3. Users cannot self-register — only admins create users
4. Financial records are shared across the org (not per-user isolation)
5. Dashboard summaries are computed on-the-fly via SQL aggregation
6. Hard delete by default for simplicity

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| DATABASE_URL | PostgreSQL connection string | postgresql://postgres:postgres@localhost:5432/finance_db |
| JWT_SECRET | Secret key for signing JWT tokens | your_secret_key |
| JWT_EXPIRES_IN | Token expiration time | 24h |