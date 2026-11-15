# Gymnosis

[![codecov](https://codecov.io/gh/jarodchristiansen/gymnosis/branch/main/graph/badge.svg?token=GHT2GI9U4T)](https://codecov.io/gh/jarodchristiansen/gymnosis)

AI-assisted workout planning for personal trainers. The AI drafts a plan from a client questionnaire, deterministic safety rules check it, and a trainer edits, approves, and sends it. Clients only ever see plans a trainer has sent.

**Live:** [gymnosis.vercel.app](https://gymnosis.vercel.app)

Gymnosis is a portfolio project. No gyms use it, and the numbers on the site describe the product, not customers. To look around, use **Try as a trainer / client / owner** on the home page: each click creates a private demo gym with example data that's deleted after 24 hours.

---

## What works today

- **AI plan drafts.** A trainer fills in a questionnaire (goal, body stats, activity level, sports, training days, experience, equipment, injuries) and gets a 7-day draft from Groq. The server builds the prompt from validated fields, asks for strict schema-shaped JSON, and checks the reply again. A reply that isn't a usable plan becomes an empty draft marked for writing by hand. Each plan records the model and prompt version that drafted it.
- **Safety rules.** Deterministic checks on every draft and every edit: equipment the client doesn't have, movements their injuries rule out (jumps with a knee injury, spinal loading with a back injury, overhead work with a shoulder injury), Olympic lifts and high volume for beginners, a schedule that doesn't match what was asked, no rest day. Blocking flags stop approval until the plan is fixed or the trainer keeps it with a note.
- **Review loop.** Plans move draft → approved → delivered. Approval is the trainer's recorded sign-off; reopening an approved plan needs a reason; only delivered plans reach the client. Every change is a single conditional write against the version the trainer saw, so concurrent edits can't overwrite each other, and each one appends to the plan's audit trail with a readable diff ("Day 1: Squat 3×5 → Squat 4×5").
- **Gyms and roles, enforced by the API.** Owners see their gym, trainers see their assigned clients, clients see only plans sent to them. Every GraphQL resolver checks the signed-in user.
- **Eval harness.** `npm run eval` drafts ten fixture questionnaires, runs the safety rules, and scores the batch (usable, clean, flags per draft, flags by rule) per model and prompt version into `evals/results/`.
- **Demo mode.** A private sandbox gym per visitor, with plans in every state. Capped per IP and overall; Mongo's TTL index deletes it after a day.
- **Sign-in** with Google, GitHub, or email and password (email accounts are created with `scripts/create-user.ts`).

## Roadmap

- Inviting clients and assigning them to trainers in the app (today: the demo gym, or `scripts/migrate-to-plans.js` for existing accounts)
- Progress tracking against a delivered plan
- Later: class scheduling, memberships, owner analytics, meal plans

---

## Tech stack

| Layer         | Technology                                                    |
| ------------- | ------------------------------------------------------------- |
| Frontend      | Next.js (pages router), React, TypeScript, styled-components |
| API           | GraphQL (Apollo Server, Apollo Client), GraphQL Codegen       |
| Auth          | NextAuth.js                                                   |
| Database      | MongoDB (Mongoose)                                            |
| AI            | Groq, OpenAI-compatible API (`openai/gpt-oss-120b` by default) |
| Testing       | Jest, React Testing Library                                   |
| Component dev | Storybook                                                     |
| Code quality  | ESLint, Prettier, Husky pre-commit hooks                      |
| CI            | GitHub Actions, Codecov                                       |
| Deployment    | Vercel                                                        |

---

## Architecture notes

- `pages/api/graphql.js` builds each request's context from the NextAuth session. The viewer's role and gym are read from the database, so a change applies without signing out.
- `db/auth.js` holds the access rules; `db/resolvers/` applies them in every resolver.
- `lib/workoutDraft.js` owns the AI call: questionnaire validation, the prompt, the JSON schema, and the checks on the reply.
- `lib/safetyRules.js` is the rules engine; `lib/planLifecycle.js` the transitions and approval checks; `lib/planDays.js` validation and diffs. All three are pure and unit-tested.
- `lib/rateLimit.js` is a fixed-window limit stored in MongoDB, so it holds across serverless instances.
- `components/` are developed in Storybook; `client_types/` is generated from the schema, and a test validates every client operation against it.

**Human-in-the-loop AI.** The AI writes drafts and nothing else. A draft can't reach a client until a trainer has resolved its blocking flags, approved it, and sent it, and the plan's history shows who did each step.

---

## Getting started

### Prerequisites

- Node.js 24
- A MongoDB connection string
- A [Groq API key](https://console.groq.com/keys) for drafting (everything else runs without it)

### Local setup

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
GROQ_API_KEY=your_groq_key
# Optional: GROQ_MODEL=openai/gpt-oss-120b
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing

```bash
npm test             # unit and component tests, with coverage
npm run eval         # score AI drafts against the fixtures (needs GROQ_API_KEY)
npm run check-types  # TypeScript
npm run check-lint   # ESLint
npm run storybook    # components in isolation
```

---

## License

MIT
