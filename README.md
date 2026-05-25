# E-Commerce CRM Dashboard

> Internal admin panel for managing users, products, and orders.
> **Live:** `ecommerce-cdp2sxnbv-eran-projects.vercel.app` · **Repo:** global

---

## Overview

Next.js 15 operational dashboard restricted to admin-role accounts. Provides real-time metrics, user role management, product CRUD with Cloudinary image uploads, order lifecycle control, and revenue analytics. Secured with strict CSP headers and JWT-gated API access.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| State | Redux Toolkit |
| Data tables | MUI DataGrid (X) |
| Charts | Recharts |
| Styling | Tailwind CSS + MUI theming |
| Security | CSP headers, X-Frame-Options: DENY |
| Testing | Vitest |
| Package manager | pnpm |

---

## Environment Variables

Create `.env.local` in the project root — **never commit this file.**

```env
# Backend API — requests are proxied through Next.js rewrites (/api/backend/*)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## Local Development

```bash
# 1. Clone and enter the project
git clone <https://github.com/erantzar/ecommerce-crm.git>
cd ecommerce-crm

# 2. Install dependencies
pnpm install

# 3. Copy and fill environment variables
cp .env.example .env.local

# 4. Start development server
pnpm dev
# → CRM at http://localhost:3002
```

---

## Other Scripts

```bash
pnpm build        # Production build
pnpm start        # Serve production build on port 3002
pnpm type-check   # Static type analysis
pnpm test         # Run Vitest unit tests
```

---

## Key Features

- **Dashboard** — live stats: total users, products, pending orders, estimated revenue (cancelled orders excluded)
- **Users** — view all accounts, change roles (customer ↔ admin), delete users
- **Products** — full CRUD with Cloudinary image upload, category/search filtering, activate/deactivate toggle
- **Orders** — paginated order list with status badges, cancel pending orders, detail view per order
- **Profile** — admin account info and sign-out
- **Mobile responsive** — collapsible sidebar drawer on mobile, adaptive DataGrid column visibility

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | eran.tzar@gmail.com | Test1234 |
| Admin | ben@spacode.co.il | Test1234 |

> Only `admin`-role accounts can access the CRM. Customer accounts are redirected to login.
