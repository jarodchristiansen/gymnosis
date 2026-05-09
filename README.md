# Gymnosis

[![codecov](https://codecov.io/gh/jarodchristiansen/gymnosis/branch/main/graph/badge.svg?token=GHT2GI9U4T)](https://codecov.io/gh/jarodchristiansen/gymnosis)

Gym management software for scheduling, membership tracking, and AI-assisted trainer workflows. Built with Next.js, GraphQL, and OpenAI — with a human-in-the-loop validation layer ensuring all AI-generated health recommendations are reviewed by a certified trainer before delivery to clients.

**Live:** [gymnosis.vercel.app](https://gymnosis.vercel.app)

---

## Features

- **AI workout & meal planning** — Generates personalized routines from a client questionnaire using OpenAI. All recommendations require trainer sign-off before being surfaced to clients.
- **Class & trainer scheduling** — Manage class calendars, assign trainers, and handle booking flows.
- **Workout tracking** — Members log sessions and track progress over time.
- **Owner dashboard & analytics** — Gym-level reporting on attendance, membership, and trainer utilization.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | CSS / Tailwind |
| API | GraphQL (Apollo), GraphQL Codegen |
| Auth | NextAuth.js |
| Database | MongoDB |
| AI/NLP | OpenAI API |
| Testing | Jest, React Testing Library, Cypress |
| Component Dev | Storybook |
| Code Quality | ESLint, Prettier, Husky pre-commit hooks |
| CI | GitHub Actions |
| Coverage | Codecov |
| Deployment | Vercel |

---

## Architecture Notes

The codebase is structured around a clear separation of concerns:

- `components/` — Reusable UI components developed and documented in Storybook
- `pages/` — Next.js route-based page components
- `helpers/` — Shared utility functions
- `lib/` — External service integrations (Apollo client, auth config)
- `db/` — Database connection and query logic
- `client_types/` — TypeScript types generated via GraphQL Codegen
- `stories/` — Storybook stories for component isolation and visual testing

**Human-in-the-loop AI:** The AI integration is intentionally gated. When a trainer triggers workout or meal plan generation, the output enters a review state before any client-facing data is updated. This reflects a deliberate product decision — health recommendations need expert validation, not raw model output.

---

## Getting Started

### Prerequisites

- Node.js v16+
- MongoDB Atlas connection string
- OpenAI API key (for AI features; app runs without it in degraded mode)

### Local Setup

```bash
git clone https://github.com/jarodchristiansen/gymnosis
cd gymnosis
npm install
```

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing

```bash
# Unit and component tests
npm run test
npm run test:coverage

# End-to-end
npm run cypress

# Lint
npm run lint
```

Component stories can be viewed in isolation via Storybook:

```bash
npm run storybook
```

---

## Roadmap

- Re-enable AI features with updated API key / model (OpenAI credits expired; scaffolding intact)
- Expand Cypress E2E coverage for scheduling and booking flows
- Add member-facing mobile view
- Stripe integration for membership billing

---

## License

MIT
