# CP Tracker - Setup Guide

This guide walks you through everything needed to run the CP Tracker project locally.

---

## Prerequisites

### 1. Node.js
- **Required:** Node.js v18 or higher
- Download from [nodejs.org](https://nodejs.org/) or use a version manager (nvm, fnm)

### 2. Supabase Account (Required)
The project uses Supabase for:
- User authentication (email/password only)
- PostgreSQL database (profiles, contest data, etc.)

**Create a free account at [supabase.com](https://supabase.com/)**

---

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click **New Project**
3. Choose organization, project name, database password, and region
4. Wait for the project to be created

---

## Step 2: Get Supabase Credentials

1. In your Supabase project, go to **Project Settings** (gear icon) → **API**
2. Copy the following:
   - **Project URL** → `SUPABASE_URL` (backend) / `VITE_SUPABASE_URL` (frontend)
   - **anon public** key → `VITE_SUPABASE_KEY` (frontend)
   - **service_role** key → `SUPABASE_KEY` (backend) — keep this secret!

---

## Step 3: Configure Environment Variables

### Backend
1. Copy the example file:
   ```powershell
   cd cp-tracker\backend
   copy .env.example .env
   ```
2. Edit `backend/.env` and fill in:
   - `SUPABASE_URL` – Your Supabase project URL
   - `SUPABASE_KEY` – Your Supabase **service_role** key

### Frontend
1. Copy the example file:
   ```powershell
   cd cp-tracker\frontend
   copy .env.example .env
   ```
2. Edit `frontend/.env` and fill in:
   - `VITE_SUPABASE_URL` – Your Supabase project URL
   - `VITE_SUPABASE_KEY` – Your Supabase **anon public** key
   - `VITE_BACKEND_URL` – Leave empty for local dev (uses Vite proxy) or set to `http://localhost:3000`

---

## Step 4: Supabase Database Setup

Run the following SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  email_verified BOOLEAN DEFAULT false,
  linkedin TEXT,
  github TEXT,
  education TEXT,
  location TEXT,
  work TEXT,
  codeforces_username TEXT,
  leetcode_username TEXT,
  codechef_username TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Service role needs access for backend operations
CREATE POLICY "Service role has full access" ON profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Dashboard tables (schema used by the app)
CREATE TABLE IF NOT EXISTS contest_ranking_info (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  codeforces_recent_contest_rating INTEGER,
  codeforces_max_contest_rating INTEGER,
  codechef_stars INTEGER,
  codechef_recent_contest_rating INTEGER,
  codechef_max_contest_rating INTEGER,
  leetcode_recent_contest_rating INTEGER,
  leetcode_max_contest_rating INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS total_questions (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  leetcode_total INTEGER DEFAULT 0,
  leetcode_easy INTEGER DEFAULT 0,
  leetcode_medium INTEGER DEFAULT 0,
  leetcode_hard INTEGER DEFAULT 0,
  codechef_total INTEGER DEFAULT 0,
  codeforces_total INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for dashboard tables
ALTER TABLE contest_ranking_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE total_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contest_ranking_info" ON contest_ranking_info
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own total_questions" ON total_questions
  FOR ALL USING (auth.uid() = id);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, updated_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### If you already have the old schema, run this migration to add missing columns:

```sql
-- Migration: Add columns for contest_ranking_info
ALTER TABLE contest_ranking_info ADD COLUMN IF NOT EXISTS codeforces_recent_contest_rating INTEGER;
ALTER TABLE contest_ranking_info ADD COLUMN IF NOT EXISTS codeforces_max_contest_rating INTEGER;
ALTER TABLE contest_ranking_info ADD COLUMN IF NOT EXISTS codechef_stars INTEGER;
ALTER TABLE contest_ranking_info ADD COLUMN IF NOT EXISTS codechef_recent_contest_rating INTEGER;
ALTER TABLE contest_ranking_info ADD COLUMN IF NOT EXISTS codechef_max_contest_rating INTEGER;
ALTER TABLE contest_ranking_info ADD COLUMN IF NOT EXISTS leetcode_recent_contest_rating INTEGER;
ALTER TABLE contest_ranking_info ADD COLUMN IF NOT EXISTS leetcode_max_contest_rating INTEGER;

-- Migration: Add columns for total_questions
ALTER TABLE total_questions ADD COLUMN IF NOT EXISTS leetcode_total INTEGER DEFAULT 0;
ALTER TABLE total_questions ADD COLUMN IF NOT EXISTS leetcode_easy INTEGER DEFAULT 0;
ALTER TABLE total_questions ADD COLUMN IF NOT EXISTS leetcode_medium INTEGER DEFAULT 0;
ALTER TABLE total_questions ADD COLUMN IF NOT EXISTS leetcode_hard INTEGER DEFAULT 0;
ALTER TABLE total_questions ADD COLUMN IF NOT EXISTS codechef_total INTEGER DEFAULT 0;
ALTER TABLE total_questions ADD COLUMN IF NOT EXISTS codeforces_total INTEGER DEFAULT 0;
```

---

## Step 5: Enable Email/Password Auth

Go to **Supabase Dashboard → Authentication → Providers** and ensure **Email** is enabled (it is enabled by default). This is required for sign up and sign in.

---

## Step 6: Run the Project

### Install Dependencies (if not already done)
```powershell
# Backend
cd cp-tracker\backend
npm install

# Frontend
cd ..\frontend
npm install
```

### Start Both Servers

**Terminal 1 – Backend:**
```powershell
cd cp-tracker\backend
npm run dev
```
Backend runs at `http://localhost:3000`

**Terminal 2 – Frontend:**
```powershell
cd cp-tracker\frontend
npm run dev
```
Frontend runs at `http://localhost:5173`

### Open the App
Visit **http://localhost:5173** in your browser.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Check that `SUPABASE_URL` and `SUPABASE_KEY` match your project and that you're using the **service_role** key for backend |
| CORS errors | Ensure backend `.env` has `NODE_ENV=development` (frontend origin `http://localhost:5173` is allowed) |
| "relation 'profiles' does not exist" | Run the SQL from Step 4 in the Supabase SQL Editor |
| API requests return 404 | Ensure backend is running on port 3000 and `VITE_BACKEND_URL` is empty (for proxy) or `http://localhost:3000` |
| **400 Bad Request** on `/contest-ranking` or `/total-questions` | Your database has the old schema. Run the **Migration** SQL (Step 4) to add the required columns: `leetcode_recent_contest_rating`, `leetcode_max_contest_rating`, `codechef_total`, etc. |
| Dashboard shows N/A for LeetCode rating | 1) Visit the LeetCode page first (with your username in profile) to fetch and save data. 2) If you see 400 errors, run the migration SQL above. |

---

## Summary Checklist

- [ ] Node.js v18+ installed
- [ ] Supabase account and project created
- [ ] `backend/.env` created with `SUPABASE_URL` and `SUPABASE_KEY`
- [ ] `frontend/.env` created with `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`, and `VITE_BACKEND_URL`
- [ ] SQL schema executed in Supabase SQL Editor
- [ ] Backend running (`npm run dev` in backend folder)
- [ ] Frontend running (`npm run dev` in frontend folder)
