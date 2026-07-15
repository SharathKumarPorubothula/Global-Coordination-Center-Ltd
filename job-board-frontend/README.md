# The Noticeboard — Job Board Frontend

A React (Vite) frontend for the job board API, styled as a noticeboard: job listings render as pinned index cards on a dark corkboard, with monospace "stamps" for metadata.

## Tech Stack
- React 18 + Vite
- React Router v6
- Axios (with JWT interceptor)
- Plain CSS with design tokens (no framework) — see `src/styles/index.css`

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Point it at your backend
Copy `.env.example` to `.env` and set the API URL:
```bash
cp .env.example .env
```
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run it
```bash
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Features
- **Auth** — register (job seeker or employer), login, JWT stored in `localStorage`, auto-attached to requests
- **Browse jobs** — search, filter (location, job type, experience level, remote/onsite), pagination
- **Job detail** — full description, requirements, skills, salary, apply modal, save job
- **Employer** — post a job, view/edit my postings, view applicants per job, update applicant status (shortlist/reject/hire)
- **Job seeker** — apply to jobs, view my applications, withdraw an application
- **Role-based routing** — protected routes redirect to login, then back to where the user was headed

## Project Structure
```
src/
├── api/
│   ├── client.js         # axios instance + JWT interceptor
│   └── services.js       # authApi, jobsApi, applicationsApi
├── context/
│   └── AuthContext.jsx   # user session, login/register/logout
├── components/
│   ├── Navbar.jsx
│   ├── JobCard.jsx
│   ├── Pagination.jsx
│   ├── Loader.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   ├── JobsList.jsx       # / — browse + filter jobs
│   ├── JobDetail.jsx      # /jobs/:idOrSlug
│   ├── Login.jsx          # /login
│   ├── Register.jsx       # /register
│   ├── PostJob.jsx        # /post-job (employer)
│   ├── MyPostings.jsx     # /my-jobs (employer)
│   ├── JobApplicants.jsx  # /my-jobs/:jobId/applicants (employer)
│   ├── MyApplications.jsx # /my-applications (job seeker)
│   └── NotFound.jsx
├── styles/                # design tokens + page-level CSS
├── App.jsx                # routes
└── main.jsx                # entry point
```

## Deploying to Vercel
1. Push this project to GitHub.
2. Import the repo in Vercel, framework preset **Vite**.
3. Set the environment variable `VITE_API_URL` to your deployed backend's URL (e.g. `https://your-api.onrender.com/api`).
4. Build command `npm run build`, output directory `dist` (Vercel detects these automatically for Vite).

Make sure the backend's `CLIENT_URL` (used for CORS) is set to your Vercel deployment URL.
