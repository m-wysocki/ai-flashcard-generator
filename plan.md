# Refactor Plan

## Goal

Refactor the current app UI without changing the core learning flow, while allowing the agreed architectural and interaction improvements:

- move from SCSS Modules to Tailwind,
- build a reusable UI primitives layer,
- split the current `AppShell`,
- route the main authenticated sections explicitly,
- use Radix for accessible interactive primitives,
- make flashcard mutation errors visible and testable.

## Decisions

- `design.md` will be the source of truth for application appearance.
- `AGENTS.md` must be updated before the UI refactor:
  - remove detailed visual guidance currently embedded there,
  - remove SCSS Modules guidance,
  - add Tailwind + UI primitives guidance,
  - point all visual decisions to `design.md`.
- Use Tailwind with design-system token configuration.
- Separate UI primitives from domain components.
- Add `clsx`, `tailwind-merge`, and `class-variance-authority`.
- Use Radix for tabs, dropdown menu, dialog, and alert dialog.
- Authenticated routes:
  - `/app` = Generator,
  - `/app/flashcards` = Fiszki,
  - `/app/review` = Review.
- Flashcards tabs use URL state:
  - `/app/flashcards?tab=due`,
  - `/app/flashcards?tab=all`,
  - `/app/flashcards?tab=add`.
- Generator `inputLanguage` remains local client state.
- PL/EN UI copy moves to a dedicated module.
- UI language preference remains in `localStorage`, wrapped by a `useUiLanguage()` hook.
- Flashcard editing moves from inline editing to a dialog.
- Flashcard deletion gets a confirmation dialog.
- Forms stay native: Server Actions plus `useFormStatus`.
- Flashcard Server Actions should return `{ ok, error }` style state and stop ignoring service errors.
- The app must always provide visible feedback when work is in progress:
  - route transitions should show a clear loading state,
  - form submissions should show pending states,
  - AI generation should show an obvious generating state,
  - dialog actions should show pending/disabled states,
  - users should never be left wondering whether a click was registered.
- Review migration happens after generator and flashcards.
- Tests focus on behavior, typecheck, lint, and manual smoke testing. No visual snapshots for this refactor.

## Proposed Structure

UI primitives:

- `src/components/ui/Button`
- `src/components/ui/IconButton`
- `src/components/ui/Badge`
- `src/components/ui/Panel`
- `src/components/ui/Card`
- `src/components/ui/Field`
- `src/components/ui/TextareaField`
- `src/components/ui/Tabs`
- `src/components/ui/DropdownMenu`
- `src/components/ui/Dialog`
- `src/components/ui/AlertDialog`
- `src/components/ui/EmptyState`
- `src/components/ui/StatList`
- `src/components/ui/Spinner`
- `src/components/ui/LoadingOverlay`
- `src/components/ui/ProgressBar`
- `src/components/ui/SubmitButton`

Domain components:

- `src/components/app-shell/AppFrame`
- `src/components/app-shell/AppHeader`
- `src/components/app-shell/BottomNav`
- `src/components/app-shell/LanguageMenu`
- `src/components/app-shell/AccountMenu`
- `src/components/generator/GeneratorView`
- `src/components/generator/GeneratorForm`
- `src/components/generator/LearningMaterialPreview`
- `src/components/flashcards/FlashcardsView`
- `src/components/flashcards/FlashcardsTabs`
- `src/components/flashcards/FlashcardsList`
- `src/components/flashcards/FlashcardCard`
- `src/components/flashcards/FlashcardForm`
- `src/components/flashcards/FlashcardEditDialog`
- `src/components/flashcards/FlashcardDeleteDialog`
- `src/components/review/ReviewSession`

Shared utilities/content:

- `src/lib/cn.ts`
- `src/content/app-copy.ts`
- `src/hooks/use-ui-language.ts`
- `src/hooks/use-route-pending.ts`

## Stage 0: Design Contract

Add `design.md` before starting visual migration.

Update `AGENTS.md`:

- remove detailed visual rules such as the current Wispr Flow inspiration,
- remove SCSS Modules and PascalCase module class naming rules,
- add Tailwind as the styling direction,
- require visual components to use `src/components/ui/*` primitives where practical,
- declare `design.md` as the source of truth for colors, typography, spacing, radius, shadows, component appearance, and visual tone,
- keep product, auth, AI, review, routing, and MVP guardrails in `AGENTS.md`,
- require a pause/question if `design.md` conflicts with PRD or MVP/domain behavior.

Acceptance:

- No conflicting SCSS/Tailwind instructions remain.
- `design.md` is explicitly referenced as the UI source of truth.
- Product and domain guardrails remain intact.

## Stage 1: Tailwind Foundation

Install and configure:

- `tailwindcss`,
- `@tailwindcss/postcss`,
- `clsx`,
- `tailwind-merge`,
- `class-variance-authority`,
- `@radix-ui/react-tabs`,
- `@radix-ui/react-dropdown-menu`,
- `@radix-ui/react-dialog`,
- `@radix-ui/react-alert-dialog`.

Add:

- Tailwind/PostCSS setup,
- global CSS with Tailwind import,
- design tokens from `design.md`,
- `cn()` helper.

Acceptance:

- App builds after setup.
- `npm run typecheck` passes.
- `npm test` passes.
- `npm run lint` passes, or any pre-existing/known issue is documented.
- Screens are not migrated yet except for any unavoidable global base changes.

## Stage 2: UI Primitives

Create `src/components/ui/*` primitives.

Rules:

- primitives must be domain-free,
- variants use `class-variance-authority`,
- conditional classes use `cn()`,
- interactive primitives use Radix where appropriate,
- primitives should expose accessible defaults without encoding product-specific text.

Initial primitives:

- `Button`,
- `IconButton`,
- `Badge`,
- `Panel`,
- `Card`,
- `Field`,
- `TextareaField`,
- `Tabs`,
- `DropdownMenu`,
- `Dialog`,
- `AlertDialog`,
- `EmptyState`,
- `StatList`,
- `Spinner`,
- `LoadingOverlay`,
- `ProgressBar`,
- `SubmitButton`.

Acceptance:

- Primitives compile and are typed.
- Loading primitives support both local inline states and broader app/route pending states.
- Existing behavior is not changed yet.
- The old components can coexist temporarily during migration.

## Stage 3: Routing And App Frame

Split the current `AppShell` responsibility.

Routes:

- `/app` renders the generator.
- `/app/flashcards` renders flashcards.
- `/app/review` keeps the focused review flow.

Refactor:

- add an app frame/header/bottom nav composition,
- bottom nav uses links instead of local section state,
- active nav state comes from pathname,
- route/navigation changes show a visible pending state, such as a top progress bar or app-frame loading indicator,
- `/app` should not fetch flashcards and review stats just to show the generator,
- `/app/flashcards` fetches flashcards, due cards, and stats.

Acceptance:

- Authenticated app still opens on generator after login.
- Bottom navigation works for Generator and Fiszki.
- `/app/review` hides bottom navigation.
- Route transitions give immediate visual feedback after navigation clicks.
- Generator and flashcards no longer depend on one large client `AppShell`.

## Stage 4: Generator

Refactor generator into domain components:

- `GeneratorView`,
- `GeneratorForm`,
- `LearningMaterialPreview`,
- generated example selection/save components as needed.

Keep:

- local `inputLanguage` state,
- current visible labels/copy,
- current generation behavior,
- an obvious AI generation pending state after submit,
- save-one-flashcard-at-a-time flow,
- staying on `/app` after saving a generated flashcard.

Move:

- PL/EN copy to a dedicated module,
- UI language access to `useUiLanguage()`,
- styling to Tailwind/UI primitives.

Acceptance:

- Generation flow behaves as before.
- Successful generated flashcard save stays on `/app`.
- Edit-before-save is preserved.
- AI generation and generated-card save clearly show pending feedback.
- Generator no longer depends on SCSS Modules.
- Behavior tests are updated for the new component boundaries.

## Stage 5: Flashcards

Move flashcards to `/app/flashcards`.

Tabs:

- `?tab=due`,
- `?tab=all`,
- `?tab=add`.

Behavior:

- tabs use URL state,
- successful manual add redirects/revalidates to `/app/flashcards?tab=all`,
- failed manual add stays on `?tab=add` and shows an error,
- edit uses a Radix dialog,
- delete uses a Radix alert dialog confirmation,
- add/edit/delete actions show pending feedback and prevent unclear double-submit states,
- server actions return useful action state instead of ignoring service errors.

Components:

- `FlashcardsView`,
- `FlashcardsTabs`,
- `FlashcardsList`,
- `FlashcardCard`,
- `FlashcardForm`,
- `FlashcardEditDialog`,
- `FlashcardDeleteDialog`.

Acceptance:

- Due, All, and Add tabs work through URL state.
- Stats remain visible where expected.
- Empty states remain actionable.
- Edit dialog is keyboard-accessible.
- Delete requires confirmation.
- Add/edit/delete errors can be shown to the user.
- Add/edit/delete pending states are visible and accessible.
- Tests cover tab routing, add success/error, edit dialog, and delete confirmation.

## Stage 6: Review

Refactor `ReviewSession` after generator and flashcards are stable.

Keep:

- focused full-screen review flow,
- no bottom nav during review,
- show front first,
- manual reveal,
- grades: Again, Hard, Good, Easy,
- Again cards return to the end of the same session,
- Web Speech API only after reveal and only on speaker tap.
- grading actions show a visible pending state so the learner knows the grade click registered.

Move:

- styling to Tailwind/UI primitives,
- repeated UI patterns to shared primitives.

Acceptance:

- Existing review behavior test passes.
- Reveal, grade, requeue, and done states work.
- Speaker button remains unavailable before reveal.
- Grade submission has clear pending feedback and avoids accidental repeated grading.
- Review route stays independent from the app bottom nav.

## Stage 7: Cleanup

Remove old styling and obsolete components:

- delete migrated `.module.scss` files,
- remove `sass` once no longer needed,
- remove old component paths after imports are migrated,
- remove unused CSS variables only after corresponding Tailwind tokens exist,
- check client/server boundaries for unnecessary client components.

Review Vercel React best-practice concerns:

- avoid broad client components,
- avoid unnecessary prop serialization from Server Components,
- fetch only route-specific data,
- avoid barrel imports that increase bundle size,
- keep independent server work parallel with `Promise.all`,
- keep native forms and Server Actions where possible.

Acceptance:

- `rg "module.scss|\\.scss"` shows no obsolete SCSS modules.
- `sass` is removed if unused.
- `npm test` passes.
- `npm run typecheck` passes.
- `npm run lint` passes.
- Manual smoke covers login target, generator, save generated card, flashcards tabs, add/edit/delete, review, and visible loading feedback for navigation and mutations.
