# Timeflow – don't log time, review it

An AI timesheet assistant that reconstructs your workday from digital signals, so instead of filling in hours by hand you confirm a suggested timesheet in about ten seconds.

**[Case study](https://bllondis.github.io/portfolio-site/cases/timeflow.html)** · **[Live app](https://timeflow-assistant-main.vercel.app/)** · React · TypeScript · Supabase · Vercel

<!-- TODO: add a screenshot of the dashboard here -->

> Solo project: research, product strategy, design system, UI and a deployed full-stack app.

---

## The problem

Logging time is a chore people postpone until Friday, then reconstruct from memory. The result is late, inaccurate timesheets and frustrated managers.

**Core reframe:** the user shouldn't *log* time, they should *review* it. Timeflow gathers signals from tools people already use (starting with Google Calendar), drafts the entries, and asks the user only to confirm or adjust.

## What's in the app

- **Dashboard** – today's suggested entries, weekly stats, deadlines and a review prompt
- **Google Calendar integration** – real OAuth 2.0 flow; calendar events appear on the dashboard as suggested entries with their source shown
- **Review and week view** – confirm, edit or add entries before submitting the week
- **Manager view and approvals** – team overview and timesheet approval flow
- **Insights and reports** – where time went, built with Recharts
- **Source and confidence transparency** – every suggested entry shows where it came from, so people can trust the automation instead of second-guessing it

## Design decisions

- **Trust vs automation.** Auto-filled time feels risky to users. The answer was transparency: each entry carries its source and an accuracy indicator, and nothing is submitted without the user's confirmation.
- **Restrained colour.** A colour-overload audit of the manager view led to strict rules: teal for time values only, orange limited to three places in the whole product.
- **Accessible by default.** Calm parchment background, Urbanist typeface, all text contrast checked against WCAG AA.

## Tech

- **React + TypeScript + Vite**, React Router, TanStack Query
- **Tailwind CSS + shadcn/ui**
- **Supabase** – Postgres, auth (Google provider with `calendar.readonly` scope), data for entries, projects, approvals and notifications
- **Google Calendar API**
- **Recharts** for insights
- **Vercel** – auto-deploys on every push to `main`

```
src/
  pages/        Dashboard, Review, WeekView, Timesheets, ManagerView, Approvals, Insights, Reports, Settings
  components/   dashboard widgets, layout, auth route guards, AI accuracy indicator
  services/     Supabase and Google Calendar data layer
  contexts/     auth and app state
supabase/       schema, seed data and Google Calendar integration tables
```

## One bug worth mentioning

The first Google OAuth flow ended in a chain of 404s. The cause wasn't routing at all: a missing `UNIQUE` constraint on the integrations table made the token upsert fail silently. Adding `unique (user_id, provider)` fixed it. It's a good reminder that "the redirect is broken" can be a database problem.

## How it was built

Research with Perplexity and ChatGPT, wireframes in Banani, hi-fi screens in Figma Make, scaffolding in Lovable, then code with Codex and Antigravity. I made the product and design decisions, defined the design system, and reviewed and shipped what the AI tools produced.

## Run locally

```bash
npm install
cp .env.example .env   # add your Supabase URL and anon key
npm run dev
```

To set up the database, run `supabase/schema.sql`, then `supabase/google_calendar_oauth.sql` and optionally `supabase/seed.sql` in the Supabase SQL editor.

## Next

- Claude API to group raw signals by project and suggest durations
- More signal sources beyond Google Calendar

---

Designed and built by [Tetiana Dovgalenko](https://bllondis.github.io/portfolio-site/) – Product Designer & AI Design Engineer, The Hague.
