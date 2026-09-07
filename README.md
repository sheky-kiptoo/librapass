# LibraPass

**Smart Library Access & Analytics System** — built for Daystar University to replace manual paper sign-in books with fast, secure digital check-in.

## The problem

Libraries using a physical visitor book face two real issues: signing in takes time (queues form at peak hours), and not every visitor has a smartphone to use a typical QR-based system.

## The solution — three check-in channels

- **QR (personal phone)** — students scan a code with their own device
- **ID card scan (kiosk)** — a shared entrance terminal reads a student's card (any barcode symbology — the card identifier is treated as an opaque string, so this works across institutions without assumptions about card format)
- **Web login (kiosk fallback)** — admission number + password, for anyone without a phone or their physical ID on them

The same kiosk automatically detects whether a scan/login is a check-in or check-out, based on whether that person already has an open session — no separate "leaving" button to find.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript, via TanStack Start/Router |
| Styling | Tailwind CSS v4 |
| Animation | Motion |
| Charts / Icons | Recharts / Lucide React |
| Database | PostgreSQL (managed by Supabase) |
| Auth | Supabase Auth |
| Security | Row Level Security (Postgres policies) — every table is scoped so a user can only ever see their own data, a librarian only their own institution, and a kiosk only what its physical location needs |
| Backend | None as a separate server — Supabase serves as the backend (Backend-as-a-Service), with one custom Postgres function handling admission-number login |

## Roles

- **Student / Staff** — check in/out, manage registered devices, view visit history and profile
- **Librarian** — live occupancy dashboard, student directory, device approval, kiosk monitoring, usage reports and analytics
- **Kiosk** — a dedicated, narrowly-permissioned account for the physical entrance terminal itself, separate from any real person's login

## Multi-tenant by design

Institutions, students, devices and visits are all scoped by `institution_id`, so the same codebase could serve more than one university without code changes — only new seed data.

## Project structure

```
LibraPass/
├── README.md
└── frontend/        — the full application (see frontend/README.md for setup)
```

## Getting started

See [`frontend/README.md`](./frontend/README.md) for local setup instructions.
