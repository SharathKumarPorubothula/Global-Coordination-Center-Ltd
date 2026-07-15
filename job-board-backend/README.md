# Job Board Backend API

A REST API for a job board application built with **Node.js**, **Express**, and **MongoDB (Mongoose)**. Supports job seekers, employers, job postings, and applications with JWT authentication and role-based access control.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken) for auth
- bcryptjs for password hashing
- helmet, cors, express-rate-limit for security

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### 3. Run the server
```bash
npm run dev     # development (nodemon)
npm start       # production
```

### 4. (Optional) Seed sample data
```bash
npm run seed
```
Creates a sample employer (`employer@acme.test` / `password123`), a sample job seeker (`jobseeker@acme.test` / `password123`), and two sample jobs.

## Data Models

**User** — `name`, `email`, `password` (hashed), `role` (`jobseeker` | `employer` | `admin`), `company` (employer info), `profile` (jobseeker info: headline, resume, skills), `savedJobs`.

**Job** — `title`, `slug` (auto-generated), `description`, `responsibilities`, `requirements`, `company`, `postedBy`, `location`, `jobType`, `experienceLevel`, `salary`, `skills`, `category`, `status`, `views`, `applicantCount`.

**Application** — `job`, `applicant`, `resumeUrl`, `coverLetter`, `status` (`submitted` | `under_review` | `shortlisted` | `rejected` | `hired`), `notes`.

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register as jobseeker or employer |
| POST | `/login` | Public | Log in, returns JWT |
| GET | `/me` | Private | Get current user profile |
| PUT | `/me` | Private | Update current user profile |

### Jobs (`/api/jobs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List jobs (search, filter, paginate) |
| GET | `/:idOrSlug` | Public | Get single job, increments view count |
| POST | `/` | Employer/Admin | Create a job posting |
| PUT | `/:id` | Owner/Admin | Update a job posting |
| DELETE | `/:id` | Owner/Admin | Delete a job posting |
| GET | `/my/postings` | Employer/Admin | Get jobs posted by current user |
| POST | `/:id/save` | Jobseeker | Toggle save/unsave a job |

**Query params for `GET /api/jobs`:** `search`, `location`, `jobType`, `experienceLevel`, `category`, `remote`, `minSalary`, `maxSalary`, `page`, `limit`, `sort`

### Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/:jobId` | Jobseeker | Apply to a job |
| GET | `/my` | Jobseeker | View my applications |
| GET | `/job/:jobId` | Owner/Admin | View applicants for a job |
| PATCH | `/:id/status` | Owner/Admin | Update application status |
| DELETE | `/:id` | Jobseeker (owner) | Withdraw an application |

## Authentication
Include the JWT in requests as a Bearer token:
```
Authorization: Bearer <token>
```

## Example Requests

**Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jamie Doe","email":"jamie@example.com","password":"secret123","role":"jobseeker"}'
```

**Create a job (employer)**
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Backend Engineer","description":"Build APIs","jobType":"full-time","location":{"city":"Hyderabad"}}'
```

**Search jobs**
```bash
curl "http://localhost:5000/api/jobs?search=node&location=Hyderabad&jobType=full-time&page=1&limit=10"
```

**Apply to a job**
```bash
curl -X POST http://localhost:5000/api/applications/<JOB_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"resumeUrl":"https://example.com/resume.pdf","coverLetter":"I would love to join..."}'
```

## Project Structure
```
job-board-backend/
├── config/db.js
├── controllers/
│   ├── authController.js
│   ├── jobController.js
│   └── applicationController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── User.js
│   ├── Job.js
│   └── Application.js
├── routes/
│   ├── authRoutes.js
│   ├── jobRoutes.js
│   └── applicationRoutes.js
├── utils/
│   ├── generateToken.js
│   └── seed.js
├── app.js
├── server.js
├── package.json
└── .env.example
```

## Deployment Notes
- MongoDB Atlas is recommended for a hosted database (`MONGO_URI` in `.env`).
- Set `NODE_ENV=production` and a strong, random `JWT_SECRET` in production.
- Set `CLIENT_URL` to your deployed frontend's URL for CORS.
