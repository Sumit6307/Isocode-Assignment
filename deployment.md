# 🚀 Deployment & Local Setup Guide

**Client:** Aavkar Realty, Ahmedabad (Formerly Company A in Brief)  
**Product:** Real Estate AI Lead-Response & Site-Visit Booking Assistant  
**Repository:** [https://github.com/Sumit6307/Isocode-Assignment](https://github.com/Sumit6307/Isocode-Assignment)  
**Live Application URL:** [https://aavkar-realty.vercel.app](https://aavkar-realty.vercel.app)

---

## 1. Quick Start (Run Locally in 3 Steps)

### Prerequisites
- **Node.js:** v18.18+ or v20+ or v24+
- **npm:** v9+ or v11+
- **Git**

### Step-by-Step Instructions

1. **Clone the repository and enter directory:**
   ```bash
   git clone https://github.com/Sumit6307/Isocode-Assignment.git
   cd Isocode-Assignment
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*

4. **Initialize Database & Seed Realistic Sample Data:**
   ```bash
   npx prisma db push
   npm run seed
   ```
   *This automatically seeds the 2 residential projects (Shubh Residency & Aarambh Heights), fact sheets, 14 days of free slots, and the sample leads (`LD-58210`, `LD-58211`, `LD-58224`).*

5. **Run the Test Suite:**
   ```bash
   npm test
   ```
   *Runs 6 comprehensive unit tests covering lead ID generation, duplicate detection, double-booking prevention, RERA compliance check, and response SLA classification.*

6. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 2. Demo Login Details for the Reviewer

For convenience during review, **One-Click Quick Login buttons** are available directly on the `/login` screen. Alternatively, sign in using these pre-seeded credentials:

| Role | Email | Password | Intended Test Flow |
| :--- | :--- | :--- | :--- |
| **Admin / Sales Head** | `admin@aavkarrealty.com` | `password123` | Analytics dashboard, Fact Sheet Editor, Slot Capacity Manager |
| **Sales Executive** | `priya@aavkarrealty.com` | `password123` | Lead Desk, chat transcript review, executive handoff |
| **Home Buyer** | `buyer@example.com` | `password123` | Interactive AI booking chat, real slot picker, RERA inquiries |

---

## 3. Environment Variables

> **Note:** Only variable names are documented below per security instructions. No secrets or credentials are hardcoded.

| Variable Name | Required | Purpose | Default / Local Fallback |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | Connection string for database | `file:./dev.db` (SQLite for zero-config local run) or PostgreSQL |
| `NEXTAUTH_SECRET` | **Yes** | JWT signing key for session auth | Random 32-character string |
| `NEXTAUTH_URL` | **Yes** | Canonical root URL of the deployment | `http://localhost:3000` |
| `GEMINI_API_KEY` | *Optional* | Google Gemini API key for dynamic LLM chat | *Built-in deterministic fact-sheet engine runs seamlessly if omitted* |

---

## 4. Production Deployment Guide (Vercel + Render PostgreSQL)

### Step A: Set up Free PostgreSQL on Render
1. Go to [Render Dashboard](https://dashboard.render.com) → Click **New +** → **PostgreSQL**.
2. Name: `aavkar-realestate-db`.
3. Choose the Free tier and click **Create Database**.
4. Copy the **External Database URL** (e.g. `postgresql://user:password@host.render.com/dbname?sslmode=require`).

### Step B: Push Schema & Seed to Render Database
From your local terminal, run with your Render URL:
```bash
# Push schema tables
npx prisma db push

# Seed projects, slots, and sample leads
npm run seed
```

### Step C: Deploy Full-Stack to Vercel
1. Go to [Vercel](https://vercel.com) → Click **Add New** → **Project**.
2. Import repository: `https://github.com/Sumit6307/Isocode-Assignment`.
3. Under **Environment Variables**, add these 4 variables:
   - `DATABASE_URL`: *(Your Render PostgreSQL External URL)*
   - `NEXTAUTH_SECRET`: `2+C3Z0M42UTL7QAyC/MXqd8DH8eY2cVd8C9YZExBBOM=`
   - `NEXTAUTH_URL`: `https://aavkar-realty.vercel.app`
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
4. Click **Deploy**. Vercel will build and deploy both frontend pages and backend APIs in under 2 minutes!

---

## 5. Key Verification Flows for the Reviewer

1. **AI Chat & Fact Sheet Grounding (`/chat` or Homepage Widget):**
   - Ask: *"What are the 3 BHK prices for Shubh Residency?"* → AI quotes ₹82L - ₹95L and states RERA Reg `PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126`.
   - Ask: *"Can you give me a 10% discount?"* → AI strictly declines per rules, never quotes unverified discounts, and offers to connect to a sales executive.
   - Switch language selector to **हिंदी (Hindi)** or **ગુજરાતી (Gujarati)** → Assistant converses fluently in buyer's preferred tongue.

2. **Site Visit Booking with Zero Double-Booking (`/chat` or `/dashboard/admin/slots`):**
   - Click *"Book a Site Visit"* → Date pills & real available time slots appear with live remaining capacities.
   - Click to reserve → Instant confirmation, location pin in Google Maps, and 24h & 2h reminder schedule shown.
   - Verify on `/dashboard/admin/slots` that the slot capacity atomically incremented.

3. **Lead Duplicate Detection (`/dashboard/leads`):**
   - Click *"Add New Lead"* and enter phone `+919876500001` (Hardik Patel's number).
   - System flags duplicate immediately, links the original record, and tags the lead as `DUPLICATE`.

4. **Executive Handoff & Auto-Summary (`/dashboard/leads/[id]`):**
   - Click any lead → view full chronological chat transcript.
   - Click *"Hand Off to Sales Executive"* → select Priya Sharma or Amit Desai.
   - Intelligent chat summary is generated and transferred to the executive's desk.

