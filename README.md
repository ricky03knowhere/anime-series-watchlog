# 🎬 AnimeSeries Watchlog

Personal media tracker for Anime and TV Series with a **Retro Cinema meets Anime Database** visual style.

## Tech Stack

| Layer     | Technology                            |
| --------- | ------------------------------------- |
| Frontend  | React, Vite, TypeScript, Tailwind CSS |
| Backend   | Node.js, Express, TypeScript          |
| Database  | Supabase PostgreSQL                   |
| Storage   | Supabase Storage                      |

## Project Structure

```
root/
├── frontend/         # React + Vite + TypeScript
│   └── src/
│       ├── api/          # Axios client & API calls
│       ├── assets/       # Static assets
│       ├── components/   # Reusable UI components
│       ├── contexts/     # React contexts
│       ├── hooks/        # Custom hooks
│       ├── layouts/      # Page layouts
│       ├── pages/        # Route pages
│       ├── services/     # Business logic
│       ├── types/        # TypeScript types
│       └── utils/        # Utility functions
│
├── backend/          # Express + TypeScript
│   └── src/
│       ├── config/       # App & Supabase config
│       ├── controllers/  # Route handlers
│       ├── middleware/    # Express middleware
│       ├── repositories/ # Database queries
│       ├── routes/       # API routes
│       ├── services/     # Business logic
│       ├── utils/        # Utility functions
│       └── validators/   # Request validation (Zod)
│
├── supabase/         # Database
│   ├── migrations/   # SQL migration files
│   └── seed/         # Seed data
│
└── docs/             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Setup Environment Variables

**Backend** — copy `backend/.env.example` to `backend/.env` and fill in:
```
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Run Development Servers

```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

## Design

- **Primary**: Purple
- **Secondary**: Cyan
- **Accent**: Yellow
- **Theme**: Retro Cinema + Anime Database with dark mode support
