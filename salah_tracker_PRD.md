# Salah Tracker — جدول السير والسلوك
## Product Requirements Document (PRD)

**Version:** v1.0 — Draft  
**Prepared by:** Claude (Anthropic)  
**Target users:** Teachers & Parents  
**Deployment:** Free tier · Vercel + Supabase  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Users & Roles](#2-users--roles)
3. [Feature List](#3-feature-list)
4. [Screens](#4-screens)
5. [Data Model](#5-data-model)
6. [Tech Stack](#6-tech-stack-100-free)
7. [Analytics](#7-analytics)
8. [Backup & Export](#8-backup--export)
9. [Build Milestones](#9-build-milestones)
10. [Constraints & Risks](#10-constraints--risks)

---

## 1. Overview

Currently, teachers manually track each student's daily Salah (prayer) performance, attendance, behaviour scores, homework completion, and personal notes using a paper sheet — **"جدول السير والسلوك لدرس (صفة)"**. This is tedious to maintain, impossible to analyse, and easy to lose.

This project replaces the paper sheet with a lightweight, fully free **Progressive Web App (PWA)** that multiple teachers can use, parents can read, and that generates monthly/yearly analytics per student.

The paper sheet tracks **30 days × multiple Salah columns**. The digital version mirrors this exactly — same rows, same columns — but adds sorting, filtering, analytics, and CSV export.

---

## 2. Users & Roles

| Role | Access |
|------|--------|
| **Admin Teacher** | Creates the class, adds students, manages teacher accounts, views all data, exports reports |
| **Teacher** | Fills in daily records for students in their assigned class. Can add notes, view student profiles |
| **Parent (read-only)** | Receives a unique magic link to view only their child's record. Cannot edit anything |

---

## 3. Feature List

### Must-Have (MVP)

| Feature | Description |
|---------|-------------|
| **Daily prayer tracker** | Grid view matching the paper sheet — 5 Fardh + Sunnah Rawatib + Congregation columns, 30 rows per month |
| **Attendance tracking** | Mark present / absent / late per day per student. Colour-coded cells |
| **Behaviour score** | 1–5 rating per day. Optional text note per entry. Visible in student profile |
| **Homework log** | Submitted / not submitted / late toggle per assignment per student |
| **Student notes** | Free-text notes per student, timestamped and tagged (behaviour / health / academic) |
| **CSV export** | Export any student, class, or month's data as a CSV file. One click |

### Should-Have

| Feature | Description |
|---------|-------------|
| **Parent view portal** | Shareable magic link per student so parents can log in and see their child's records, no account needed |
| **Monthly analytics** | Per-student: attendance %, prayer completion rate, avg behaviour, homework submission rate — shown as charts |
| **Yearly analytics** | 12-month trend lines per student. Class-level summaries. Exportable as PDF/CSV |
| **PWA offline mode** | Works offline; syncs when back online. Critical for areas with poor connectivity |

### Nice-to-Have

| Feature | Description |
|---------|-------------|
| **Bulk entry mode** | Mark all students present in one tap, then edit exceptions |
| **Notifications / reminders** | Push notification to remind teacher to fill today's records at prayer times |
| **Arabic UI (RTL)** | Full Arabic labels and RTL layout to match the original paper sheet language |
| **Google Sheets sync** | Optional auto-push of monthly data to a linked Google Sheet as an additional backup |

---

## 4. Screens

1. Login / Magic link
2. Dashboard (class overview)
3. Student list
4. Student profile
5. Monthly grid (the main tracking view)
6. Daily entry form
7. Analytics view (monthly + yearly)
8. Export centre
9. Settings

---

## 5. Data Model

Stored in **Supabase (PostgreSQL)**. Row-level security ensures teachers only see their class; parents only see their child.

```sql
-- Classes
classes (
  id uuid PRIMARY KEY,
  name text,
  lesson_name text,
  location text,
  teacher_id uuid REFERENCES teachers(id),
  created_at timestamptz
)

-- Teachers
teachers (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  name text,
  role text CHECK (role IN ('admin', 'teacher')),
  class_id uuid REFERENCES classes(id)
)

-- Students
students (
  id uuid PRIMARY KEY,
  name_ar text,
  name_en text,
  class_id uuid REFERENCES classes(id),
  parent_token text UNIQUE,  -- used for magic link login
  created_at timestamptz
)

-- Daily Records (main tracking table — mirrors the paper sheet)
daily_records (
  id uuid PRIMARY KEY,
  student_id uuid REFERENCES students(id),
  date date,
  -- Fardh prayers (0 = missed, 1 = performed, null = not recorded)
  fajr smallint,
  dhuhr smallint,
  asr smallint,
  maghrib smallint,
  isha smallint,
  -- Sunnah Rawatib
  rawatib_fajr smallint,
  rawatib_dhuhr smallint,
  rawatib_asr smallint,
  rawatib_maghrib smallint,
  -- Congregation (Salah al-Jamaa)
  jamaa_fajr smallint,
  jamaa_dhuhr smallint,
  jamaa_asr smallint,
  jamaa_maghrib smallint,
  jamaa_isha smallint,
  -- Other tracking
  attendance text CHECK (attendance IN ('present', 'absent', 'late')),
  behaviour_score smallint CHECK (behaviour_score BETWEEN 1 AND 5),
  notes text,
  recorded_by uuid REFERENCES teachers(id),
  UNIQUE(student_id, date)
)

-- Assignments
assignments (
  id uuid PRIMARY KEY,
  class_id uuid REFERENCES classes(id),
  title text,
  due_date date
)

-- Homework submissions
homework (
  id uuid PRIMARY KEY,
  student_id uuid REFERENCES students(id),
  assignment_id uuid REFERENCES assignments(id),
  status text CHECK (status IN ('submitted', 'late', 'missing')),
  submitted_at timestamptz
)
```

> Each column in the paper sheet maps 1-to-1 to a field in `daily_records`. Prayer columns store 0 (missed), 1 (performed), or null (not recorded).

---

## 6. Tech Stack (100% Free)

| Layer | Tool | Free Tier Notes |
|-------|------|-----------------|
| **Frontend** | Next.js 14 (React) | App Router, PWA via next-pwa, RTL support |
| **Hosting** | Vercel | Hobby tier — unlimited deployments, custom domain |
| **Database** | Supabase (PostgreSQL) | Free: 500 MB DB, 1 GB storage. Estimated usage: ~50 MB |
| **Auth** | Supabase Auth | Email/password for teachers; magic-link tokens for parents |
| **Charts** | Recharts | Line, bar, radial charts for analytics |
| **PDF export** | jsPDF | Client-side generation — no server cost |
| **Styling** | Tailwind CSS + RTL plugin | Zero cost |
| **Offline sync** | Workbox (via next-pwa) | Cache-first reads; queues writes when offline |
| **Backup (auto)** | Supabase daily snapshots | Available in Supabase dashboard |
| **Backup (manual)** | CSV export | Teacher downloads and saves to Google Drive |

> ⚠️ **Note:** Supabase free tier pauses databases after 7 days of inactivity. Fix: add a free Vercel cron job that pings the DB daily.

---

## 7. Analytics

### Per-Student Monthly Report

Computed server-side via Supabase functions, shown on the student profile page.

| Metric | Visualisation |
|--------|---------------|
| Attendance rate | Days present ÷ school days — bar chart per week |
| Prayer completion | % of each of the 5 Salah performed — radar chart |
| Sunnah consistency | Rawatib + Jamaa streaks and gaps — heatmap |
| Behaviour trend | Daily score as a line chart with 7-day moving average |
| Homework rate | On time / late / missed — donut chart |
| Notes timeline | All teacher notes chronologically, tagged |

### Yearly Overview

- 12-month trend lines for each metric above
- Class-level heatmap showing low-attendance or low-behaviour months
- Filterable by metric, month, or student group

### Class-Level Dashboard

- Optional leaderboard for best prayer consistency
- Alerts for students with 3+ consecutive absences or dropping behaviour scores
- Teacher summary card: total entries this week

---

## 8. Backup & Export

| Method | Description |
|--------|-------------|
| **CSV export** | Per-student, per-class, or full database. Filter by date range. Available on any screen |
| **PDF report card** | Formatted monthly report per student. Arabic + English. Print-ready A4 layout |
| **Supabase auto-backup** | Automatic daily snapshots. Downloadable as SQL dump from dashboard |
| **Manual Google Drive** | Teacher downloads CSV monthly and uploads to personal Google Drive |

---

## 9. Build Milestones

### Week 1 — Foundation
- Supabase project setup + schema
- Next.js scaffold + Tailwind
- Teacher auth (email/password)
- Student CRUD
- Class setup

### Week 2 — Core Tracking Grid
- Monthly grid UI (mirrors paper sheet)
- Prayer entry (all Fardh + Rawatib + Jamaa columns)
- Attendance marking
- Behaviour score entry
- Homework log
- Student notes

### Week 3 — Export + Parent View
- CSV export
- PDF report card (jsPDF)
- Magic link parent portal
- Multi-teacher roles + permissions

### Week 4 — Analytics + PWA
- Monthly/yearly charts (Recharts)
- Class dashboard with alerts
- Offline support (Workbox)
- Arabic RTL UI
- Deploy to Vercel + custom domain

---

## 10. Constraints & Risks

| Risk | Mitigation |
|------|------------|
| **Supabase free tier DB pausing** | Vercel cron job pings DB daily. Zero cost |
| **Free tier storage limit (500 MB)** | Estimated usage is ~50 MB even after years of data — safe |
| **Offline sync conflicts** | If two teachers edit the same record offline, last-write-wins. Show conflict warning |
| **Parent privacy** | Magic links expire in 30 days. Parents see only their child. No cross-student data visible |
| **Scalability** | If class grows beyond 100 students, Supabase Pro ($25/mo) is the upgrade path |

---

## Quick Start Commands

```bash
# 1. Create Next.js app
npx create-next-app@latest salah-tracker --typescript --tailwind --app

# 2. Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install recharts jspdf papaparse
npm install next-pwa
npm install -D @types/papaparse

# 3. Set environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 4. Deploy to Vercel
npx vercel --prod
```

---

*PRD generated by Claude · Anthropic · June 2026*
