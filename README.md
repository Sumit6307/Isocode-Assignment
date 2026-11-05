# Real Estate AI Lead-Response & Site-Visit Booking Assistant

> **Client:** Aavkar Realty, Ahmedabad (Referenced as Company A in problem brief)  
> **Repository:** [https://github.com/Sumit6307/Isocode-Assignment](https://github.com/Sumit6307/Isocode-Assignment)  
> **Tech Stack:** Next.js 16 (App Router), TypeScript, Prisma ORM, SQLite/PostgreSQL, Google Gemini API, Tailwind CSS  

---

## Overview

An enterprise AI lead-response and site-visit booking assistant built for **Aavkar Realty**, a residential developer in Ahmedabad with 2 live projects (420 apartments, 2 and 3 BHK, ₹65L - ₹1.2Cr).

The system replaces manual telecalling (which suffered from a 14-hour median first response and a 35% cold lead loss costing ₹1.26 Cr annually) with a **sub-2-minute 24/7 AI concierge** in English, Hindi, and Gujarati.

### Core Capabilities
* **Inbound Lead Desk with Duplicate Detection:** Sanitizes phone numbers and emails to detect and flag duplicates (`DUP` badge) across portals, ads, website, and hoardings.
* **Multilingual AI Concierge:** Verified grounding in the Sales Head's official Fact Sheet. Complies with RERA registration disclosures and DPDP Act 2023. Refuses discount quoting.
* **Zero Double-Booking Guarantee:** Atomic database transaction locks on showroom slots (3 parties max capacity).
* **Automated Reminders & Location Pin:** Instant Google Maps coordinates + 24-hour and 2-hour reminders before site visits.
* **Executive Handoff:** Named sales executive assignment with automated AI briefing summaries.
* **Executive Analytics Dashboard:** Real-time tracking of response times, visits show-up rate, and channel-wise cost per visit (at ₹1,000 ad spend per lead).

---

## Quick Start (Run Locally)

### 1. Clone & Install
```bash
git clone https://github.com/Sumit6307/Isocode-Assignment.git
cd Isocode-Assignment
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(Add your `GEMINI_API_KEY` in `.env`)*

### 3. Initialize Database & Seed
```bash
npx prisma db push
npm run seed
```

### 4. Run Test Suite
```bash
npm test
npm run audit
```

### 5. Launch Dev Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Demo Reviewer Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin / Sales Head** | `admin@aavkarrealty.com` | `password123` | Full dashboard, Fact Sheet Editor, Slot Capacity Manager |
| **Sales Executive** | `priya@aavkarrealty.com` | `password123` | Lead Desk, chat transcripts, executive handoff |
| **Buyer** | `buyer@example.com` | `password123` | AI Booking Concierge, real-time slot reservation |

---

## Submission Artifacts

- **Word Document:** [`Technical-Design-Document.docx`](./Technical-Design-Document.docx)
- **Technical Design Document (Markdown):** [`technical-design-document.md`](./technical-design-document.md)
- **Deployment Guide:** [`deployment.md`](./deployment.md)
- **Submission ZIP:** [`submission.zip`](./submission.zip)
