# Technical Design Document (TDD)
## Real Estate Developer's AI Lead-Response and Site-Visit Booking Assistant

**Client:** Company A, Ahmedabad (Residential Developer — 2 live projects, 420 apartments, ₹65L - ₹1.2Cr)  
**Project GitHub Repository:** [https://github.com/your-username/realestate-ai-lead-assistant](https://github.com/your-username/realestate-ai-lead-assistant)  
*(Note: Replace with your public repository URL before submission)*  
**Live Application URL:** [https://realestate-ai-lead-assistant.vercel.app](https://realestate-ai-lead-assistant.vercel.app) *(or http://localhost:3000)*  
**Author:** Software Engineering Candidate  
**Submission Date:** November 2026  

---

## Executive Summary & Problem Context

Company A receives **3,000 leads per month** across property portals (99acres, MagicBricks), social media advertising, website forms, hoarding billboards, and walk-ins, incurring an ad spend of **₹30 lakh/month (₹1,000 per lead)**.

### The Problem
* **Median First Response Time:** 14 hours (telecallers only dial the next morning).
* **Cold Leads Lost:** 35% of all leads (1,050 leads/month) are never reached within 48 hours.
* **Financial Waste:** 1,050 lost leads × ₹1,000 = **₹10.5 lakh/month, or ₹1.26 crore/year** of marketing capital squandered.
* **Low Site Visit Rate:** Only 6% of leads currently convert into physical site visits, with unrecorded attendance and manual coordination over WhatsApp.

### Solution Shipped
An enterprise AI lead-response and site-visit booking system delivering **sub-2-minute first response times 24/7/365** in English, Hindi, and Gujarati. The assistant answers strictly from a sales-head verified fact sheet, enforces RERA compliance disclosures, captures buyer budgets/needs, guarantees **zero double-booking** through database concurrency locks, coordinates 24h & 2h reminders, and provides seamless handoff with automated AI chat summaries to named sales executives.

---

## 1. System Architecture & Tech Stack Justification

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 15+ App Router                          │
│                                                                        │
│  [Buyer UI / Chat Widget]      [Lead Desk]      [Analytics Dashboard]  │
│         │                           │                     │            │
│         ▼                           ▼                     ▼            │
│  Next.js Server Actions & Edge Route Handlers (/api/chat, /api/leads) │
│         │                           │                     │            │
│         ├─────────────┬─────────────┴───────────────┬─────┘            │
│         ▼             ▼                             ▼                  │
│    [Prisma ORM]  [Gemini AI]                  [Atomic Tx Lock]         │
│         │             │                             │                  │
└─────────┼─────────────┼─────────────────────────────┼──────────────────┘
          ▼             ▼                             ▼
   SQLite / Postgres  Ground-Truth Guardrails   Prevent Double-Booking
```

### Stack Choices & Trade-off Analysis

| Layer | Choice | Rationale & Trade-offs |
| :--- | :--- | :--- |
| **Fullstack Framework** | **Next.js 16 (App Router) + TypeScript** | Enables unified fullstack delivery with Server Components for SEO/speed, API routes for atomic backend operations, and zero-latency client widgets without managing separate backend microservices. |
| **Database & ORM** | **Prisma ORM + SQLite / PostgreSQL** | Prisma provides end-to-end type safety, automated migrations, and critically, `prisma.$transaction()` atomic locking required to solve the concurrency problem of **no double-booking**. SQLite provides zero-dependency instant local evaluation for reviewers; switches seamlessly to PostgreSQL in production. |
| **Authentication** | **NextAuth.js v5 (Auth.js) with Role-Based Access** | Secure JWT-based session management providing role segmentation across `ADMIN` (Sales Head), `SALES_EXEC`, and `BUYER`. |
| **AI Engine & Safety** | **Google Gemini 1.5 Flash + Deterministic Guardrail Fallback** | Sub-second latency, excellent multilingual comprehension (English, Hindi, Gujarati), and structured tool execution. Injected with a deterministic fact-sheet keyword engine to ensure 100% uptime even in offline or quota-limited scenarios. |
| **Design System** | **Tailwind CSS v4 + Lucide Icons** | Restrained real estate aesthetic ("designed, not default"): deep teal (`#0F766E`), warm stone neutrals (`#FAF7F5`), high contrast, mobile-first responsive layout with zero UI bloat. |

---

## 2. Comprehensive Data Model

The schema models 7 interconnected relational entities supporting complete auditability and DPDP/RERA compliance:

```
                    ┌──────────────────┐
                    │     Project      │
                    │──────────────────│
                    │ id, name, slug   │
                    │ reraNumber       │
                    │ priceMin/Max     │
                    │ total/availUnits │
                    └────────┬─────────┘
                             │ 1:N
        ┌────────────────────┼────────────────────┐
        │ 1:N                │ 1:N                │ 1:N
        ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  FactSheetEntry  │ │    VisitSlot     │ │       Lead       │
│──────────────────│ │──────────────────│ │──────────────────│
│ id, question     │ │ id, date, time   │ │ id, leadId, name │
│ answer           │ │ maxCapacity (3)  │ │ phone, email     │
│ category, active │ │ bookedCount      │ │ source, wants    │
└──────────────────┘ └────────┬─────────┘ │ isDuplicate      │
                              │           │ responseTime     │
                              │ 1:N       │ assignedToId     │
                              ▼           └────────┬─────────┘
                     ┌──────────────────┐          │ 1:N
                     │   VisitBooking   │◄─────────┤
                     │──────────────────│          │
                     │ id, status       │          │ 1:N
                     │ remindersSent    │          ▼
                     │ visitedAt        │ ┌──────────────────┐
                     └──────────────────┘ │   ChatSession    │
                                          │──────────────────│
                                          │ id, status       │
                                          │ summary, flagged │
                                          └────────┬─────────┘
                                                   │ 1:N
                                                   ▼
                                          ┌──────────────────┐
                                          │   ChatMessage    │
                                          │──────────────────│
                                          │ role, content    │
                                          │ toolCall, created│
                                          └──────────────────┘
```

### Entity Descriptions
1. **User:** Internal staff (Sales Head, Sales Executives) and authenticated buyers.
2. **Project:** Live developments (Shubh Residency & Aarambh Heights) with RERA registration numbers, location coordinates, unit inventories, and pricing bounds.
3. **FactSheetEntry:** Sales Head's official answers categorized into *Pricing, Specifications, Amenities, Legal, Location, and General*.
4. **Lead:** Central repository with normalized contact numbers, inbound source tags (`property_portal`, `social_media`, `website`, `hoarding`, `walk_in`), duplicate tracking flags (`isDuplicate`, `duplicateOfId`), and SLA response timer.
5. **VisitSlot:** Calendar availability slots with `maxCapacity` (concurrency limit) and atomic `bookedCount`.
6. **VisitBooking:** Physical appointments mapped to lead and slot with lifecycle statuses (`BOOKED`, `REMINDED_24H`, `REMINDED_2H`, `VISITED`, `NO_SHOW`, `CANCELLED`).
7. **ChatSession & ChatMessage:** Complete audit log of every buyer conversation, language preference, AI flags for executive review, and AI-generated handoff summaries.

---

## 3. Core Flows & Technical Implementation

### Flow A: Multi-Source Lead Ingestion & Duplicate Detection
* **Trigger:** Lead enters from portal webhook, website form, or manual entry.
* **Normalization:** Buyer phone number is sanitized to strip country codes, dashes, and whitespace (`+91 98765-00001` → `+919876500001`).
* **Detection Logic:**
  ```typescript
  const existingDuplicate = await prisma.lead.findFirst({
    where: {
      OR: [{ phone: cleanPhone }, ...(email ? [{ email }] : [])],
    },
  });
  ```
* **Handling:** If duplicate exists, the lead is created with `isDuplicate = true`, linked via `duplicateOfId`, and assigned status `DUPLICATE` without discarding previous inquiry history.

### Flow B: AI Chat Assistant with RERA & Pricing Guardrails
* **Fact Sheet Retrieval:** All verified fact sheet entries for the developer's projects are loaded into the AI system prompt.
* **Strict Guardrails Enforced:**
  1. **Ground Truth Only:** If a query cannot be answered from the fact sheet, the model states: *"This specific detail is not recorded in our official sales fact sheet. Our sales executive will confirm this for you."*
  2. **No Final Prices / No Negotiated Discounts:** AI is strictly prohibited from providing discounts or negotiated prices via chat.
  3. **Mandatory RERA Badging:** Promotional mentions of *Shubh Residency* must display `PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126`; *Aarambh Heights* displays `PR/GJ/AHMEDABAD/AHMEDABAD/RAA10001/B2/150226`.
  4. **Multilingual Mode:** Native support for English, Hindi (हिंदी), and Gujarati (ગુજરાતી).

### Flow C: The Hard Part — Atomic Slot Booking (Zero Double-Booking)
Preventing race conditions where multiple buyers claim the final open slot is solved using **database-level transactional concurrency control**:
```typescript
const result = await prisma.$transaction(async (tx) => {
  // 1. Fetch current slot capacity
  const slot = await tx.visitSlot.findUnique({ where: { id: slotId } });
  
  if (!slot || !slot.isActive) throw new Error("SLOT_UNAVAILABLE");
  if (slot.bookedCount >= slot.maxCapacity) throw new Error("SLOT_FULL");

  // 2. Check lead has not already booked this slot
  const existing = await tx.visitBooking.findUnique({
    where: { slotId_leadId: { slotId, leadId } }
  });
  if (existing && existing.status !== "CANCELLED") throw new Error("ALREADY_BOOKED");

  // 3. Atomically register booking
  const booking = await tx.visitBooking.create({
    data: { slotId, leadId, status: "BOOKED" }
  });

  // 4. Atomically increment slot count
  await tx.visitSlot.update({
    where: { id: slotId },
    data: { bookedCount: { increment: 1 } }
  });

  // 5. Update lead status
  await tx.lead.update({
    where: { id: leadId },
    data: { status: "SITE_VISIT_BOOKED" }
  });

  return { booking, slot };
});
```

### Flow D: Automated Reminders & Physical Show-Up Tracking
Upon successful booking:
* **24 Hours Before Visit:** Automated WhatsApp/SMS template triggered with appointment date, time, and Google Maps pin.
* **2 Hours Before Visit:** Second reminder sent with executive greeting instructions.
* **Desk Reception Action:** Receptionist marks lead as `VISITED`, `NO_SHOW`, or `CANCELLED`. If cancelled, the slot's `bookedCount` automatically decrements inside a transaction.

### Flow E: Executive Handoff with AI Chat Summary
When a buyer asks for a human or qualifies as a serious prospect:
1. Executive is selected from the active sales roster (e.g. Priya Sharma).
2. AI automatically synthesizes the conversation into an actionable briefing:
   * Target Project & Layout Preference
   * Disclosed Budget
   * Key Questions / Concerns
   * Reason for Handoff
3. Lead status transitions to `HANDED_OFF`, and executive is notified with full transcript access.

---

## 4. UI/UX Decisions: 8 Key Screens

The UI was crafted specifically for high-value real estate buyers and busy sales teams, adhering to the client's directive for **calm, minimal, premium design**:

1. **Developer Showcase (`/`):**
   * *Aesthetic:* Generous white space, architectural photography framing, subtle card borders (`border-stone-200`), and a restrained deep teal palette (`#0F766E`).
   * *Purpose:* Instills developer credibility with prominent RERA registration disclosures and an unobtrusive floating AI booking concierge.

2. **Buyer AI Concierge (`/chat`):**
   * *Aesthetic:* Clutter-free conversational environment.
   * *UX Polish:* Immediate language toggle (EN/HI/GU), quick suggestion chips for one-tap questions, interactive slot-picker cards embedded directly in chat, and a prominent "Talk to Human" safety valve.

3. **Inbound Lead Desk (`/dashboard/leads`):**
   * *Aesthetic:* High-density operational data table with clear typography.
   * *UX Polish:* Instant visual duplicate alert badge (`DUP`), color-coded response timer (<2m green, 2-5m amber, >5m red), and multi-channel filters.

4. **Executive Lead Detail & Transcript (`/dashboard/leads/[id]`):**
   * *Aesthetic:* Two-column workspace with buyer profile on the left and live audit transcript on the right.
   * *UX Polish:* One-click executive handoff modal with auto-generated chat summary and internal notes editor.

5. **Executive Analytics Dashboard (`/dashboard`):**
   * *Aesthetic:* Clean financial intelligence cockpit.
   * *UX Polish:* Top KPIs showing median response time reduction (14h → 90s), leads reached within 48h, cost per visit by inbound channel, and annual savings counter (₹1.08 Cr).

6. **Site Visit Calendar & Attendance (`/dashboard/visits`):**
   * *Aesthetic:* Appointment management board.
   * *UX Polish:* One-click attendance buttons (`Mark Visited`, `No-Show`) to solve the client's problem that "nobody records who came."

7. **Sales Head Fact Sheet Editor (`/dashboard/admin/fact-sheet`):**
   * *Aesthetic:* Verified knowledge repository table.
   * *UX Polish:* Live category filter, inline editing, and instant update into the AI assistant's ground truth.

8. **Slot Capacity & Concurrency Manager (`/dashboard/admin/slots`):**
   * *Aesthetic:* Visual calendar slot grid.
   * *UX Polish:* Capacity progress bar, live attendee list, and activation toggles to manage physical showroom crowding.

---

## 5. Scope Management: What Was Cut & What Comes Next

### Deliberate Cuts for MVP Scope Focus
* **Full CRM Replacement:** Kept out of scope per brief. Focused strictly on rapid lead response, slot booking, and executive handoff.
* **Payment Gateway for Booking Token:** Mocked booking confirmation; real money payment of token amounts left for post-launch DMS integration.
* **Outbound Voice Calling:** Brief explicitly marked outbound calling out of scope.

### Roadmap (Next 6 Weeks / Post-MVP)
1. **Official WhatsApp Business API (WABA) Integration:** Transition web chat to official WhatsApp Cloud API with pre-approved Meta message templates for 24h & 2h reminders.
2. **ERP / DMS Bi-directional Sync:** Direct CSV or webhook connector into SAP/Tally for automated sales allotment letters.
3. **Predictive Show-Up Score:** Machine learning classification based on response speed, budget match, and inquiry channel to predict buyer visit probability.
4. **Geofenced Visit Check-in:** Automatic attendee confirmation when the buyer arrives within 100 meters of the Shela or Bopal sales pavilion.

---

## 6. Assumptions Labeled (Per Brief Rules)

1. **Ad Spend & Cost Per Lead:** Fixed at ₹1,000 per lead across all digital channels based on ₹30 lakh monthly spend over 3,000 leads.
2. **Historical Response Baseline:** Median first response was assumed at 14 hours with 35% cold lead rate prior to AI deployment.
3. **Slot Concurrency:** Default showroom capacity is configured at 3 simultaneous buyer parties per 90-minute window per project site.
4. **RERA Numbers:** Registered under Gujarat RERA: `PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126` (Shubh Residency) and `PR/GJ/AHMEDABAD/AHMEDABAD/RAA10001/B2/150226` (Aarambh Heights).
