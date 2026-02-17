# Scholarship Chatbot — Full Project (Advanced)

This repository contains a full-stack scholarship-matching web app:
- Backend: Node.js + Express + Postgres
- Frontend: React (Vite)
- DB schema: Postgres (SQL in infra/)
- Features: auth, profiles, scholarship CRUD, matching, notifications, admin UI, chatbot slot filling, AI-based process extraction.

This README provides quick setup steps. Full file contents are supplied in parts (part 1..6). Follow them in order.

---

## Quick start (local, no Docker)

1. Install prerequisites:
   - Node.js (v18+)
   - PostgreSQL (local) or use Supabase
   - Git
   - VS Code (recommended)

2. Create the database (pgAdmin or psql):
   - Create database: `scholarship_db`
   - Run SQL: `infra/schema.sql` and `infra/seeds.sql`

3. Backend
   ```bash
   cd backend
   cp .env.example .env
   # edit .env and set DATABASE_URL, JWT_SECRET, MAIL_*, HF_API_KEY
   npm install
   npm run dev
