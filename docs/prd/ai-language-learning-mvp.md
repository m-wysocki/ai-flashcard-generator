# AI Language Learning App MVP PRD

## Problem Statement

Polish speakers learning English often encounter two practical learning moments: they want to express a Polish thought naturally in English, or they see an English word or phrase and want to understand how it is used. Generic translators and chatbots can help in the moment, but they do not turn those moments into durable practice material.

The app should let a learner quickly generate natural English translations and example sentences, save useful examples as flashcards, and review them later using spaced repetition. The product is primarily for the creator, friends, and portfolio demonstration, so it should be polished, focused, mobile-first, and protected from public abuse.

## Solution

Build a monolithic fullstack Next.js app where an authenticated user can:

- enter Polish or English text into a generator,
- receive structured English learning material with Polish meanings,
- edit and save one generated example as a flashcard,
- manually create flashcards,
- review due flashcards with self-grading and FSRS scheduling,
- listen to the English answer during review using browser speech playback.

The app is not a general AI chat product. AI is used only to generate learning material. Flashcard review is deterministic and does not call AI.

## User Stories

1. As a Polish speaker learning English, I want to enter a Polish sentence, so that I can learn how to say it naturally in English.
2. As a Polish speaker learning English, I want to enter an English word or phrase I found elsewhere, so that I can understand its Polish meaning and English usage.
3. As a learner, I want to explicitly choose whether my input is Polish or English, so that the app interprets my intent correctly.
4. As a learner, I want to see several natural English variants for Polish input, so that I can choose the phrase that fits my meaning.
5. As a learner, I want to see Polish meanings for English input, so that I can understand unfamiliar English.
6. As a learner, I want to see example English sentences with Polish translations, so that I can learn words and phrases in context.
7. As a learner, I want AI results to be structured into translations, examples, and notes, so that I can scan them quickly.
8. As a learner, I want to save one example at a time as a flashcard, so that I can keep only useful material.
9. As a learner, I want to edit a generated flashcard before saving, so that the front, back, and notes match how I want to study.
10. As a learner, I want each flashcard to have a front, back, and notes, so that the card stays focused and simple.
11. As a learner, I want flashcards to test Polish to English production, so that I practice recalling natural English.
12. As a learner, I want to manually create a flashcard, so that I can add material without using AI.
13. As a learner, I want new manual flashcards to be due immediately, so that I can review them right away.
14. As a learner, I want generated flashcards to be due immediately, so that saved material enters practice immediately.
15. As a learner, I want to see how many cards are due today, so that I know whether I should review.
16. As a learner, I want to see the total number of cards, so that I can understand my collection size.
17. As a learner, I want to see how many cards I reviewed today, so that I can track daily activity.
18. As a mobile learner, I want a bottom navigation with Generator and Fiszki, so that the two main workflows are easy to reach.
19. As a learner, I want the app to open on the generator after login, so that I can quickly create learning material.
20. As a learner, I want the Fiszki section to have Do powtorki, Wszystkie, and Dodaj tabs, so that review, management, and manual creation are organized.
21. As a learner, I want to start a review session from due cards, so that I can practice scheduled material.
22. As a learner, I want review to show only the front first, so that I must recall the English answer myself.
23. As a learner, I want to reveal the answer manually, so that I control the review pace.
24. As a learner, I want to grade myself with Again, Hard, Good, or Easy, so that FSRS can schedule the next review.
25. As a learner, I want review to avoid text input, so that I can answer mentally on mobile.
26. As a learner, I want AI to be absent from review, so that reviews are fast, cheap, and predictable.
27. As a learner, I want review to be a focused full-screen view, so that I am not distracted by the rest of the app.
28. As a learner, I want bottom navigation hidden during review, so that mobile review controls have enough space.
29. As a learner, I want to exit review early, so that I can stop when interrupted.
30. As a learner, I want untouched cards to remain due if I exit review early, so that no learning is skipped.
31. As a learner, I want Again cards to return at the end of the same session, so that I can retry cards I missed.
32. As a learner, I want every review grade to update FSRS immediately, so that my review history remains accurate.
33. As a learner, I want to hear the English back side after revealing a card, so that I can practice pronunciation.
34. As a learner, I want pronunciation playback to start only when I tap a speaker button, so that audio does not surprise me on mobile.
35. As a learner, I want to view all flashcards, so that I can inspect my saved material.
36. As a learner, I want to edit existing flashcards, so that I can correct or improve them later.
37. As a learner, I want to delete flashcards, so that I can remove material I no longer want.
38. As a learner, I want an actionable empty state when no cards are due, so that I can go to the generator or add a card manually.
39. As a user, I want to register with email, password, and invite code, so that access stays restricted.
40. As a user, I want a correct invite code to activate my account immediately, so that I can use the app without email approval.
41. As a user, I want generic registration errors, so that the app does not reveal whether an email already exists.
42. As a user, I want generic login errors, so that account existence is not leaked.
43. As a user, I want passwords to be hashed, so that credentials are not stored in plain text.
44. As the app owner, I want one private invite code configured by environment variable, so that only invited people can register.
45. As the app owner, I want a daily AI generation limit per user, so that accidental API costs are bounded.
46. As the app owner, I want only successful AI generations to count against the limit, so that users are not penalized for technical failures.
47. As the app owner, I want minimal AI generation logs, so that limits work without storing prompts and outputs.
48. As a user, I want a friendly error if AI generation fails, so that I can retry without seeing technical details.
49. As a user, I want invalid AI structured output to be retried once server-side, so that transient model formatting issues can recover.
50. As a visitor, I want a minimal public portfolio landing page, so that I understand the project before logging in.
51. As a visitor, I want login and register links on the landing page, so that invited users can access the app.
52. As a portfolio reviewer, I want the public page to be honest about restricted access, so that it does not look like an open SaaS.
53. As a user, I want the UI language to be switchable, so that Polish and English interface demos are possible.
54. As a user, I want UI language preference stored locally in the browser, so that the database stays simple.
55. As a developer, I want OpenAI calls to happen only on the server, so that API keys are never exposed to the browser.
56. As a developer, I want structured AI responses validated with Zod, so that malformed AI output does not enter the app.
57. As a developer, I want the OpenAI model configurable by environment variable, so that cost and quality can be adjusted without code changes.
58. As a developer, I want the app to keep working if OpenAI config is missing, so that only the generator fails instead of the whole app.
59. As a developer, I want missing invite code config to disable registration only, so that login and existing accounts still work.
60. As a developer, I want to build the app with TDD on selected behaviors, so that core behavior is protected without over-testing UI details.

## Implementation Decisions

- The app will be a monolithic Next.js App Router application using TypeScript.
- Backend responsibilities stay inside Next.js through Server Components, Server Actions, Route Handlers, and server-only modules.
- The database will be Neon PostgreSQL accessed through Prisma migrations.
- Authentication will use Auth.js with credentials, bcrypt password hashing, database sessions, secure cookies, and generic auth errors.
- Registration will require a single reusable invite code configured as an environment variable.
- A valid invite code means the account is active immediately; email verification and admin approval are out of scope.
- Password validation will require at least 8 characters.
- Duplicate email registration should return a generic registration failure, not a duplicate-email-specific message.
- The primary learner is a Polish speaker learning English.
- The generator accepts Polish or English input, but the learning target is always English.
- The user manually selects the input mode: Polish input or English input.
- Polish input means “how do I say this naturally in English?”
- English input means “what does this mean in Polish and how is it used naturally in English?”
- AI output will be non-streaming and structured.
- Polish input output should include natural English translations, English example sentences with Polish translations, and optional notes.
- English input output should include Polish meanings, English example sentences with Polish translations, and optional notes.
- OpenAI communication happens only server-side.
- AI response parsing is validated with Zod.
- Invalid structured output gets one server-side retry.
- Technical AI failures show a simple retryable error to the user.
- The daily AI generation limit is per user.
- Only successful, validated generations shown to the user count against the daily limit.
- AI logs are minimal and store user, created date, input language, model, and success status.
- AI logs do not store full input or output in MVP.
- The OpenAI model is configurable by environment variable.
- Missing OpenAI configuration should make only the generator fail gracefully, not block the whole app.
- Missing invite code configuration should make only registration unavailable, not block the whole app.
- Flashcards have front, back, and notes as learning content.
- Flashcards do not store source text in MVP.
- Flashcards are Polish to English production cards.
- Saving from AI is one flashcard at a time.
- Generated flashcards can be edited before saving.
- Manual flashcard creation is supported with front, back, and notes.
- All new flashcards are due immediately.
- FSRS is used for scheduling and should store the required scheduling state per card.
- Review is self-graded with Again, Hard, Good, and Easy.
- Review does not include typed answers, answer matching, or AI grading.
- Review sessions start from due cards.
- Cards graded Again return to the end of the same session.
- Every review grade updates FSRS immediately.
- The user can exit review early; untouched cards remain due and unchanged.
- Review should be a focused full-screen experience.
- Bottom navigation is hidden during review.
- English answer playback is available only in review after the answer is revealed.
- Playback uses Web Speech API in MVP and is triggered manually by a speaker button.
- The UI is mobile-first, especially flashcards and review.
- Desktop support matters most for the generator.
- The authenticated app has a bottom navigation with Generator and Fiszki.
- The default authenticated route is the generator dashboard.
- The Fiszki section uses tabs for Do powtorki, Wszystkie, and Dodaj.
- The All flashcards view supports view, edit, and delete.
- Minimal stats are due today, total cards, and reviewed today.
- The public root page is a minimal portfolio landing with project description and login/register links.
- There is no unauthenticated interactive demo in MVP.
- Routing uses a protected `/app` namespace, with auth routes outside it.
- Proposed routes are `/`, `/login`, `/register`, `/app`, `/app/flashcards`, and `/app/review`.
- UI language is switchable between Polish and English.
- UI language preference is stored locally in the browser.
- The implementation should prefer deep modules for auth registration/login behavior, AI generation parsing and limiting, flashcard persistence rules, FSRS review scheduling, and environment configuration.

## Testing Decisions

- The project will use TDD for important behavior, not exhaustive test coverage for every component.
- Tests should verify public behavior through stable interfaces, not private implementation details.
- Work should proceed in vertical slices: one behavior test, minimal implementation, then the next behavior.
- The first TDD tracer bullet is the auth flow.
- The auth tracer should cover registration with a valid invite code, registration rejection with an invalid invite code, generic failure for duplicate email, successful login, and generic login failure.
- The test runner should be chosen during app scaffold setup; do not use Vite-based test tooling unless explicitly reintroduced.
- React Testing Library should be used only where component behavior matters.
- Playwright is optional and should be limited to a small number of smoke tests after core flows exist.
- Strong candidates for focused tests are auth validation, invite-code registration, AI response schema parsing, AI daily-limit behavior, flashcard creation/edit/delete rules, due queue behavior, and FSRS review scheduling.
- UI styling, simple presentational components, Prisma schema shape, and private helper implementation details should not be heavily tested.

## Out of Scope

- Separate backend service or microservice architecture.
- Open public registration.
- Admin approval by email.
- Email verification.
- Password reset.
- OAuth login.
- Multiple invite codes, one-time invite codes, and admin-generated invites.
- Decks, tags, categories, bulk actions, suspend, archive, and schedule reset.
- Import and export, including CSV and Anki export.
- Typed answer checking.
- AI-graded answers.
- Multiple choice review.
- AI usage during flashcard review.
- Stored source text on flashcards.
- Full AI generation history.
- Streaming AI responses.
- Public interactive AI demo.
- Stored audio files.
- IPA or phonetic transcription fields.
- Rich analytics, charts, retention reports, and heatmaps.
- Full production email workflows.
- Heavy E2E test coverage in the first MVP pass.

## Further Notes

- The product should feel like a focused learning tool, not a generic chatbot.
- The most important portfolio story is a clean fullstack app with server-side AI integration, protected auth, database-backed flashcards, and deterministic spaced repetition.
- The app should avoid overengineering and stay close to the current MVP decisions.
- Future extensions can include richer invitation management, OpenAI TTS, Anki export, tags/decks, richer progress analytics, or a public demo mode.
