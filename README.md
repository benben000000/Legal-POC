# Legal-POC — Philippine Legal Practice Management Platform

A production-ready legal practice management platform engineered for Philippine boutique law firms and solo practitioners, compliant with Philippine procedural rules and the Data Privacy Act of 2012 (RA 10173).

---

## 🚀 Instant Vercel Deployment (Zero-Config)

This repository is pre-configured for **zero-setup, 1-click deployment on Vercel**:

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** ➔ **"Project"**.
3. Import this repository: `https://github.com/benben000000/Legal-POC.git`.
4. Click **"Deploy"** (Leave all root directory, build command, and environment variable fields as default — built-in fallbacks are fully configured).
5. Your live legal practice platform will be ready in under 60 seconds!

### 🔑 Pre-Seeded Demo Login Credentials
Once deployed, log into your application using:
- **URL**: `/login`
- **Email**: `admin@legalsuite.ph`
- **Password**: `Admin123456!`
- **Role**: Lead Attorney (Administrator)

---

## ✨ Core Legal Modules & Features

1. **Dashboard & Analytics**: Active matters count, urgent procedural deadlines, billable revenue metrics, and recent activity audit feed.
2. **Matters Hub (`/matters`)**: Case tracking with docket numbers, court branches, assigned counsel, and multi-filter search.
3. **Task Workflow Kanban (`/tasks`)**: 4-stage procedural task management (`TODO`, `IN_PROGRESS`, `UNDER_REVIEW`, `DONE`) with drag-and-drop interaction.
4. **Procedural Deadlines (`/deadlines`)**: Philippine Rules of Court statutory deadline tracking with urgency indicators and completion status.
5. **Digital Document Vault (`/documents`)**: Case binder management with category tags (Pleadings, Motions, Evidence, Transcripts, Contracts) and multi-filter keyword search.
6. **Fee Accounting & Billing (`/billing`)**: Time tracking, billable entries, Statement of Account (SOA) generation, and invoice tracking in Philippine Pesos (PHP ₱).
7. **Team & Staff Access (`/team`)**: Role-based access control (LEAD_ATTORNEY, ASSOCIATE, STAFF) with invitation links and permission boundaries.
8. **Global Omnibox Search (`Ctrl+K` or `/api/search`)**: Instant cross-module search indexing matters, docket numbers, and case documents.

---

## 🛡️ Production & Security Engineering

- **Compute & Database Colocation**: Configured in `vercel.json` with `"regions": ["sin1"]` (Singapore), colocated adjacent to Neon PostgreSQL in AWS Singapore (`ap-southeast-1`) for sub-10ms query execution.
- **Enterprise Security Headers**: Strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS with 2-year max-age and preload), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Permissions-Policy`.
- **Sliding-Window Rate Limiting**: Abuse and brute-force protection on authentication endpoints (5 attempts/min per IP) with automatic Upstash Redis support and memory fallback.
- **Vercel Speed Insights**: Integrated real-user Core Web Vitals (LCP, FID/INP, CLS) telemetry.
- **Audit Logging**: Comprehensive PostgreSQL audit trail recording IP addresses, user agents, timestamps, and data changes for compliance.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/benben000000/Legal-POC.git
cd Legal-POC

# Install dependencies (automatically runs prisma generate)
npm install

# Run the local development server
npm run dev

# Run automated end-to-end integration checks
node scripts/test-workflow.js

# Build production bundle
npm run build
```

---

## 📄 License
Private & Confidential — Benedict Garcia / Legal-POC. All rights reserved.
