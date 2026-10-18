# WorkGrid — Intelligent Workforce Allocation Platform

**A full-stack workforce management platform that helps organizations assign the right people to the right projects while managing skills, availability, and team capacity.**

[**Live Demo**](https://work-grid-six.vercel.app/) 

---

## Overview

WorkGrid is a multi-tenant workforce management application designed to simplify employee management, project staffing, and resource allocation.

Traditional resource planning can lead to scheduling conflicts, overloaded employees, underutilized capacity, and difficulty finding people with the right skills. WorkGrid addresses these challenges through skill-based employee recommendations, allocation validation, utilization analytics, deadline notifications, and real-time project collaboration.

The platform supports multiple organizations, each with its own employees, projects, allocations, and collaboration data.

## Key Features

### Organization Management
- Create a new organization or join an existing organization using its organization code.
- Separate organization data using tenant-level access controls.
- Support for Admin, Manager, and Employee roles.

### Employee & Project Management
- Manage employee profiles, skills, departments, and working capacity.
- Create and manage projects, deadlines, required skills, and project status.
- Archive and restore projects where permitted.

### Intelligent Resource Allocation
- Recommend employees based on required project skills.
- Consider employee availability and existing active allocations.
- Validate working capacity and overlapping project assignments before allocation.
- Restrict allocation suggestions to authorized users and employees within the same organization.

### Utilization Analytics
- Calculate employee utilization using allocation data.
- View project and allocation statistics.
- Analyze skill distribution and departmental workforce data.
- Use MongoDB aggregation to perform allocation calculations efficiently.

### Notifications & Collaboration
- Deadline-related notifications for projects.
- Read, dismiss, and manage notifications.
- Real-time project chat powered by Socket.IO.
- Message editing, deletion, and read-status handling, subject to application rules.

### Security
- JWT-based authentication.
- Password hashing with bcrypt.
- Role-based access control (RBAC).
- Organization-level data isolation across APIs and real-time chat.
- API rate limiting and request validation.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router |
| Styling & UI | Tailwind CSS, Framer Motion, Lucide React |
| API communication | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Real-time communication | Socket.IO |
| Performance & middleware | MongoDB Aggregation, Express Rate Limit, Compression |
| Frontend deployment | Vercel |
| Backend deployment | Render |
| Database hosting | MongoDB Atlas |

## Architecture

```text
                   User
                    |
                    v
          React + Vite Frontend
               (Vercel)
                    |
             REST API / Axios
                    |
                    v
          Node.js + Express API
               (Render)
             /      |      \
            v       v       v
      MongoDB    JWT/RBAC   Socket.IO
       Atlas                  |
                              v
                      Real-time Chat
```

The backend uses a modular structure with routes, controllers, middleware, models, and utility modules. Authentication and authorization are enforced on the server, while tenant-aware database queries restrict access to the authenticated user's organization.

## Performance Optimization

The utilization analytics API was optimized by moving allocation grouping and summation from Node.js into a MongoDB aggregation pipeline.

The optimization included:
- Using `$match` and `$group` to process active allocation data in MongoDB.
- Selecting only the required employee fields.
- Using `.lean()` for read-only employee queries.
- Executing independent database operations concurrently with `Promise.all()`.

**Measured HTTP API benchmark**

| Metric | Before | After |
|---|---:|---:|
| Average response time | 17.09 ms | 14.05 ms |
| Median response time | 13.06 ms | 9.63 ms |

The average response time decreased by approximately **17.8%**, with results remaining equivalent in the benchmark.

*Benchmark context: 30 measured HTTP requests against a small local dataset. These results demonstrate the observed improvement in that test setup and are not a claim of production-scale performance.*

## Getting Started

### Prerequisites

Install the following:
- Node.js and npm
- A MongoDB Atlas account or another reachable MongoDB deployment
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Kashvi108/WorkGrid.git
cd WorkGrid
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-strong-random-secret>
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Replace the placeholders with your own values. Ensure that your MongoDB database user and network access rules permit the backend to connect.

### 4. Start the backend

From the `backend` directory:

```bash
npm run dev
```

The API server should start on port 5000 unless another port is configured.

### 5. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### 6. Configure the frontend API URL

Create a `.env.local` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 7. Start the frontend

From the `frontend` directory:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Deployment

WorkGrid is deployed using the following services:

| Component | Platform |
|---|---|
| Frontend | [Vercel](https://work-grid-six.vercel.app/) |
| Backend | [Render](https://workgrid-backend-q9ab.onrender.com) |
| Database | MongoDB Atlas |

For deployment, configure environment variables in the respective hosting dashboards rather than committing credentials to the repository.

**Frontend environment variable:**

```env
VITE_API_URL=https://workgrid-backend-q9ab.onrender.com/api
```

**Backend environment variables:**

```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-production-secret>
CLIENT_URL=https://work-grid-six.vercel.app
NODE_ENV=production
```

Configure the Atlas IP access list and backend CORS settings for the deployed environment. If the frontend's production domain changes, update the backend's allowed origin accordingly.

## Project Structure

```text
WorkGrid/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── socket/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## Learning Outcomes

Building WorkGrid provided practical experience with:
- Full-stack application architecture using the MERN stack.
- REST API development and modular backend design.
- JWT authentication, RBAC, and multi-tenant authorization.
- MongoDB schema design, indexing, and aggregation pipelines.
- Scheduling and resource-capacity validation.
- Real-time communication with Socket.IO.
- API benchmarking and query optimization.
- Deployment and environment configuration across Vercel, Render, and MongoDB Atlas.

## Future Improvements

- Add automated unit, integration, and end-to-end tests.
- Implement concurrency-safe allocation reservations to prevent race conditions under simultaneous requests.
- Improve skill matching with semantic similarity.
- Add invite-code expiration, rotation, and revocation.
- Expand performance testing with larger datasets and concurrent workloads.

---

**Built by Kashvi**  
*Full-Stack Development · Resource Planning · Multi-Tenant Applications*
