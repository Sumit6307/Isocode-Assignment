# 🚀 Deployment & Local Setup Guide

**Client:** Aavkar Realty, Ahmedabad (Formerly Company A in Brief)  
**Product:** Real Estate AI Lead-Response & Site-Visit Booking Assistant  
**Repository:** Public GitHub Repository (see TDD for URL)

---

## 1. Quick Start (Run Locally in 3 Steps)

### Prerequisites
- **Node.js:** v18.18+ or v20+ or v24+
- **npm:** v9+ or v11+
- **Git**

### Step-by-Step Instructions

1. **Clone the repository and enter directory:**
   ```bash
   git clone <YOUR_REPO_URL>
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

## 4. Production Deployment Guide (Vercel / Railway / Cloud)

### Deploying to Vercel (Recommended)
1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set the Build Command: `npx prisma generate && next build`
4. In **Environment Variables**, configure:
   - `DATABASE_URL` (PostgreSQL connection string, e.g. Neon, Supabase, or Railway Postgres)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your deployed Vercel domain)
   - `GEMINI_API_KEY` (your Google Gemini API key)
5. Deploy and run post-deploy migration: `npx prisma db push && npm run seed`

### Docker Deployment
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

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

