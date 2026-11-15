# Gymnosis

[![codecov](https://codecov.io/gh/jarodchristiansen/gymnosis/branch/main/graph/badge.svg?token=GHT2GI9U4T)](https://codecov.io/gh/jarodchristiansen/gymnosis)

AI-assisted workout planning for personal trainers. The AI drafts a plan from a client questionnaire; a trainer edits it and saves it before the client ever sees it.

**Live:** [gymnosis.vercel.app](https://gymnosis.vercel.app)

Gymnosis is a portfolio project. No gyms use it, and the numbers on the site describe the product, not customers.

---

## What works today

- **AI plan drafts.** Trainers fill in a short questionnaire (goal, body stats, activity level, sports, training days) and get a structured 7-day workout draft from Groq. The server builds the prompt from validated fields, asks for schema-shaped JSON, and checks the reply again before returning it. Each draft records the model and prompt version that wrote it.
- **Trainer editing.** The draft opens in an editor. Nothing is saved to a client until the trainer saves it.
- **Client dashboards.** Trainers see the client list and each client's saved plans. Clients see only their own.
- **Role-based access, enforced by the API.** Every GraphQL resolver checks the signed-in user: admins see every account, trainers read and write plans for clients, clients read only themselves. Drafting is rate-limited per trainer.
- **Sign-in** with Google, GitHub, or email and password (email accounts are created with `scripts/create-user.ts`).

## Roadmap

- Plan review states (draft, in review, approved, delivered) with an audit trail
- Safety rules from the questionnaire: injuries, equipment, experience
- Gyms with their own trainers, and clients assigned to a trainer
- A small eval harness that scores drafts for schema validity and safety rules
- A one-click demo as a trainer, client, or gym owner
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

- `pages/api/graphql.js` builds each request's context from the NextAuth session. The viewer's role is read from the database, so a role change applies without signing out.
- `db/auth.js` holds the access rules; `db/resolvers/` applies them in every resolver.
- `lib/workoutDraft.js` owns the AI call: questionnaire validation, the prompt, the JSON schema, and the checks on the reply. A reply that isn't a usable plan becomes a `DRAFT_INVALID` error, not a crash.
- `lib/rateLimit.js` is a fixed-window limit stored in MongoDB, so it holds across serverless instances.
- `components/` are developed in Storybook; `client_types/` is generated from the schema.

**Human-in-the-loop AI.** A draft is returned to the trainer's editor and never written to the client's record by the AI. Only a trainer or admin can save a plan to a client.

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
npm run check-types  # TypeScript
npm run check-lint   # ESLint
npm run storybook    # components in isolation
```

---

## License

MIT
