# Vercel Production Readiness & Operations Playbook

**Target Project**: Legal Demo (Philippine Legal Practice Management)  
**Live Production Domain**: `https://legal-demo-azure.vercel.app/`  
**Current Plan**: Vercel Hobby (Free Tier)  
**Compute & DB Colocation**: Vercel `sin1` (Singapore) ⟷ AWS Neon `ap-southeast-1` (Singapore)

---

## 1. Production Checklist Verification Matrix

### A. Operational Excellence
| Requirement | Status | Implementation Details |
|---|---|---|
| **Incident Response & Rollbacks** | **ACTIVE** | Documented in Section 2 below. Vercel provides 1-click Instant Rollback to any previous deployment hash without rebuilding. |
| **Stage, Promote, & Rollback** | **ACTIVE** | Single production branch (`main`) with GitHub CI/CD automation. Each push creates an immutable deployment URL. |
| **Monorepo Build Caching** | **N/A** | Standalone Next.js application (not a monorepo). Turborepo not required. |
| **Zero-Downtime DNS Migration** | **READY** | Currently operating on `*.vercel.app`. When attaching a custom domain (e.g. `firmname.ph`), point CNAME / ALIAS to `cname.vercel-dns.com` with automatic Let's Encrypt certificate generation. |

### B. Security
| Requirement | Status | Implementation Details |
|---|---|---|
| **Content Security Policy (CSP)** | **ACTIVE** | Enforced in `next.config.ts` restricting script execution, object-src, frame-ancestors, and whitelisting Vercel Speed Insights. |
| **HTTP Security Headers** | **ACTIVE** | `HSTS` (2 years + includeSubDomains), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. `X-Powered-By` disabled. |
| **Rate Limiting** | **ACTIVE** | Sliding-window limiter on `/api/auth/login` (5 attempts / 60s per IP) with automatic fallback from Upstash Redis to in-memory store. Returns `429 Too Many Requests` with `Retry-After` header. |
| **Role-Based Access Control (RBAC)**| **ACTIVE** | Server-side role enforcement on all API routes and UI pages (`LEAD_ATTORNEY`, `ASSOCIATE`, `PARALEGAL`, `STAFF`, `CLIENT`). |
| **Session & Cookie Security** | **ACTIVE** | HttpOnly, Secure, SameSite=Strict cookies with database-backed session revocation. |
| **Audit Logs** | **ACTIVE** | Full audit trail table (`AuditLog`) capturing user, IP address, timestamp, and entity mutations for Philippine Data Privacy Act (RA 10173) compliance. |
| **Deterministic Builds** | **ACTIVE** | `package-lock.json` committed and pinned for clean `npm ci` builds on Vercel edge build servers. |
| **DDoS & Bot Mitigation** | **ACTIVE** | Vercel Edge Layer 3/4 DDoS protection active by default. Custom Layer 7 WAF rules available upon Pro tier upgrade. |

### C. Reliability
| Requirement | Status | Implementation Details |
|---|---|---|
| **Caching Headers** | **ACTIVE** | Next.js automatically marks static bundles with `Cache-Control: public, max-age=31536000, immutable`. Transactional API routes serve `Cache-Control: no-store`. |
| **Field Telemetry** | **ACTIVE** | `@vercel/speed-insights` installed and mounted in root layout to track real-user Core Web Vitals (LCP, FID/INP, CLS). |
| **Graceful Degraded States** | **ACTIVE** | Rate limiters and external telemetry fail open with warnings rather than taking down critical legal workflows. |

### D. Performance
| Requirement | Status | Implementation Details |
|---|---|---|
| **Function & Database Region Colocation** | **ACTIVE** | `vercel.json` pins function compute to `"regions": ["sin1"]` (Singapore). Colocated directly with Neon PostgreSQL in AWS `ap-southeast-1` (< 10ms network round-trip). |
| **Font Optimization** | **ACTIVE** | Inlined via `next/font/google` (`Geist`, `Geist_Mono`), eliminating runtime Google Fonts network requests. |
| **Payload Minimization** | **ACTIVE** | Prisma queries select only explicit fields (`select: { ... }`) to avoid over-fetching and memory bloat. |

### E. Cost Optimization
| Requirement | Status | Implementation Details |
|---|---|---|
| **Fluid Compute** | **ACTIVE** | Automatic Vercel concurrency optimization enabled. |
| **Spend Safeguards** | **ACTIVE** | Hobby tier imposes hard caps with zero unexpected billing surprises. |

---

## 2. Operational Playbook: Rollback & Recovery Procedures

### Scenario 1: Critical Bug in Production (Instant 1-Click Rollback)
If an error is discovered in a live production release:
1. Open your browser to [Vercel Dashboard](https://vercel.com/) ➔ Select project **legal-demo** (or **legal-demo-azure**).
2. Click the **Deployments** tab.
3. Locate the last known good deployment (prior commit).
4. Click the three dots (`...`) on the right of the deployment row ➔ Select **Instant Rollback** (or **Promote to Production**).
5. Vercel instantly switches traffic at the Edge without rebuilding. Downtime: **0 seconds**.

### Scenario 2: Git-Based Clean Revert
1. In your local terminal:
   ```bash
   git revert HEAD
   git push origin main
   ```
2. Vercel will automatically trigger a clean build and update production.

---

## 3. Optional Service Integrations (Plug-and-Play)

### 1. Upstash Redis (Distributed Edge Rate Limiting)
If traffic scales across multiple regional serverless instances:
1. Create a free database on [Upstash](https://upstash.com/).
2. In Vercel Project Settings ➔ **Environment Variables**, add:
   - `UPSTASH_REDIS_REST_URL`: `https://your-instance.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN`: `your-token`
3. The app automatically detects these keys and activates distributed atomic rate limiting via REST pipeline.

### 2. Sentry (Error Tracking & Alerting)
1. In Vercel Project Settings ➔ **Environment Variables**, add:
   - `SENTRY_DSN`: `https://...`
   - `NEXT_PUBLIC_SENTRY_DSN`: `https://...`

---

## 4. Vercel Plan Upgrade Guide (When Scaling Beyond Hobby)

Upgrade to **Vercel Pro ($20/seat/mo)** when your firm requires:
1. **Multiple Team Members**: Collaborative dashboard access and team deployment permissions.
2. **Custom WAF Rules**: IP allowlisting/denylisting, custom firewall rules, and rate-limiting rules at the edge CDN level.
3. **Native Log Drains**: Streaming edge and function logs directly to Datadog, Axiom, or BetterStack.
4. **Password Protection / SSO**: Protect staging or internal environments behind Vercel Authentication or SAML SSO.
