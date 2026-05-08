# Agent Instructions

## Product Context

Build an AI language learning app for Polish speakers learning English. The app turns two learning moments into practice material:

- the learner has a Polish thought and wants natural English phrasing,
- the learner sees an English word or phrase and wants Polish meaning plus natural English usage.

The MVP is a focused learning tool, not a general AI chat product. Use `docs/prd/ai-language-learning-mvp.md` as the source of truth for product scope. Use `idea.md` as supporting project guidance for stack, architecture, and engineering principles. If the two conflict, follow the PRD.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for `m-wysocki/ai-flashcard-generator`. See `docs/agents/issue-tracker.md`.

### Triage labels

This repo uses the default triage label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain docs layout. See `docs/agents/domain.md`.

## Scope Guardrails

- Keep the app as a monolithic fullstack Next.js App Router application.
- Do not create a separate backend service unless the user explicitly changes the architecture.
- Keep backend responsibilities inside Next.js Server Components, Server Actions, Route Handlers, and server-only modules.
- Build for restricted access: invite-code registration, authenticated app routes, and a minimal public landing page.
- Keep OpenAI usage limited to generation of structured learning material.
- Do not use AI during flashcard review; review must stay deterministic, fast, and cheap.
- Stay inside MVP unless the user explicitly asks for future-scope work.

## Stack Decisions

- Language and app framework: TypeScript and Next.js App Router.
- Database: Neon PostgreSQL through Prisma migrations.
- Auth: Auth.js credentials provider, database sessions, secure cookies, and bcrypt password hashing.
- Validation: Zod for form payloads, API/server action payloads, auth input, and AI structured output.
- AI provider: OpenAI API, called only from server-side code.
- Review scheduling: FSRS for spaced repetition state and next-review scheduling.
- UI: SCSS Modules and Radix UI, mobile-first.
- Deployment target: Vercel with Neon.

## Domain Rules

- The learner is a Polish speaker learning English.
- The learning target is always English.
- The generator must let the user explicitly choose Polish input or English input.
- Polish input means: "How do I say this naturally in English?"
- English input means: "What does this mean in Polish and how is it used naturally in English?"
- AI output should be structured into translations or meanings, example English sentences with Polish translations, and optional notes.
- Flashcards are Polish-to-English production cards with `front`, `back`, and `notes`.
- New generated and manual flashcards are due immediately.
- Flashcards do not store source text in the MVP.
- Saving from AI is one flashcard at a time, with edit-before-save.

## Auth Rules

- Registration requires email, password, and one reusable invite code configured by environment variable.
- A valid invite code activates the account immediately.
- Missing invite code configuration disables registration only; login for existing accounts should still work.
- Passwords must be hashed and never stored in plain text.
- Passwords must be at least 8 characters.
- Duplicate email registration must return a generic registration failure.
- Login failures must be generic and must not reveal whether the email exists.

## AI Rules

- Never expose OpenAI API keys to client code.
- The OpenAI model must be configurable by environment variable.
- Missing OpenAI configuration should make the generator fail gracefully, not block the whole app.
- AI responses must be validated as structured output before use.
- Invalid structured output gets one server-side retry.
- Only successful, validated generations shown to the user count against the daily per-user AI limit.
- AI generation logs should be minimal: user, created date, input language, model, and success status.
- Do not store full prompts or full AI outputs in AI logs for the MVP.

## Review Rules

- Review sessions start from due cards.
- Show only the front first; the learner reveals the answer manually.
- Self-grading uses Again, Hard, Good, and Easy.
- Every review grade updates FSRS immediately.
- Again cards return to the end of the same session.
- If the user exits early, untouched cards remain due and unchanged.
- Review is a focused full-screen flow; hide bottom navigation during review.
- English answer playback is available only after reveal and only when the user taps a speaker button.
- Use browser Web Speech API for playback in MVP.

## UI Rules

- The authenticated app opens on the generator after login.
- Use bottom navigation with Generator and Fiszki for the authenticated mobile app.
- The Fiszki section has Do powtorki, Wszystkie, and Dodaj tabs.
- Show minimal stats: due today, total cards, and reviewed today.
- Include an actionable empty state when no cards are due.
- Keep the public root page minimal and honest about restricted access.
- Support Polish and English UI language demos; store language preference locally in the browser.
- Use Wispr Flow (`https://wisprflow.ai/`) as the visual inspiration for typography and overall styling: modern SaaS polish, generous readable sans-serif type, soft neutral backgrounds, restrained high-contrast CTAs, subtle rounded interface surfaces, and light product-like UI framing. Do not copy Wispr Flow branding, assets, logo, or exact layouts.
- Prefer clean, accessible, responsive UI over decorative complexity.
- Use SCSS Modules for component styling.
- Name component-level classes in PascalCase.
- Prefer a parent class with nested child selectors using the `&Child` convention.
- Example:

```scss
.Flashcard {
  &Header {
    display: flex;
  }

  &Content {
    padding: 1rem;
  }
}
```

## Engineering Rules

- Prefer deep modules for auth, AI generation parsing and limiting, flashcard persistence, FSRS scheduling, and environment configuration.
- Keep tests behavior-focused and exercise public interfaces.
- Use TDD for important behavior, especially auth validation, invite-code registration, AI response parsing, daily AI limits, flashcard rules, due queues, and FSRS review scheduling.
- Do not use Vite-based tooling for tests unless the user explicitly changes this decision.
- Choose the test runner deliberately when the app scaffold is created, and keep test commands aligned with that choice.
- Use React Testing Library only where component behavior matters.
- Keep Playwright to a small number of smoke tests after core flows exist.
- Avoid heavy tests for styling, private helpers, Prisma schema shape, or simple presentational components.
- Prefer simple, maintainable, type-safe code over broad abstractions.
- Avoid premature optimization, unnecessary libraries, and enterprise patterns.

## Useful Commands

- `npm test` runs the configured test suite.
- `npm run typecheck` runs TypeScript checking.
- Add lint and format commands when the Next.js app scaffold introduces them.
