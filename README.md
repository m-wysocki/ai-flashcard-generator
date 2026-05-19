# AI Flashcard Generator

A focused web app for Polish speakers learning English.
Instead of trying to be a general AI chat, this project turns real
language-learning moments into practical flashcards and schedules them for
effective review.

## What problem this solves

Language learners repeatedly hit two situations:

1. **"How do I say this naturally in English?"** (starting from Polish)
2. **"What does this English phrase mean, and how is it used naturally?"**
   (starting from English)

The app supports both flows, generates structured learning material with AI,
and lets the user save one edited flashcard at a time directly into a
spaced-repetition workflow.

## Core MVP features

- AI generation in two explicit input modes:
  - **Polish input** -> natural English phrasing
  - **English input** -> Polish meaning + natural English usage
- Structured AI output:
  - translation/meaning
  - natural English example sentences
  - Polish translations for examples
  - optional usage notes
- Save flow with **edit-before-save**, one flashcard at a time
- Flashcard model focused on production practice: `front`, `back`, `notes`
- New cards are due immediately
- Deterministic review flow powered by **FSRS**:
  - grades: Again / Hard / Good / Easy
  - schedule updates immediately after each grade
  - "Again" cards return to the end of the same session
- Flashcard sections:
  - Due
  - All cards
  - Add manually
- Lightweight learning stats: due today, total cards, reviewed today
- English answer playback after reveal (browser Web Speech API)
- Restricted access model (invite-code registration + authenticated routes)

## Product and engineering principles

- Clear MVP scope with strong guardrails
- AI is used only where it adds direct value: generating learning material
- Review remains deterministic, fast, and low-cost (no AI during reviews)
- Secure-by-default auth behavior and failure handling
- Structured validation for server inputs and AI outputs
- Maintainable fullstack architecture without unnecessary services

## Tech stack

- **Framework:** Next.js (App Router), TypeScript
- **Architecture:** monolithic fullstack Next.js app
- **Database:** Neon PostgreSQL + Prisma
- **Authentication:** Auth.js credentials + DB sessions + bcrypt password hashing
- **Validation:** Zod
- **AI:** OpenAI API (server-side only, model configurable via environment variable)
- **Spaced repetition:** FSRS
- **UI:** Tailwind CSS, Radix UI, reusable UI primitives
- **Icons:** lucide-react
- **Deployment target:** Vercel

## Security and AI safeguards

- Passwords are hashed (never stored in plaintext)
- Registration requires a reusable invite code from environment config
- Login/registration failures are generic (no account-enumeration leaks)
- OpenAI keys are never exposed to client code
- AI responses must pass structured validation before display/use
- Invalid structured output gets one server-side retry
- Daily AI limits count only successful, validated generations shown to users
- AI logs are intentionally minimal (no full prompts or full outputs)

## Project structure (high level)

- `src/app` - Next.js App Router routes and screens
- `src/components` - domain UI and reusable UI primitives
- `src/lib` (and related server modules) - core logic:
  - auth
  - AI generation/parsing/limits
  - flashcard persistence
  - FSRS scheduling
  - environment configuration

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Testing and quality checks

```bash
npm test
npm run typecheck
```

The project emphasizes behavior-focused testing, with TDD for high-risk logic
such as auth validation, AI parsing, daily limits, due queues, and FSRS
scheduling.
