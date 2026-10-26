# ADR 0001: Inbox jako domyślne lądowisko + limit 100 aktywnych kart

Status: zaakceptowana

## Kontekst

Nowe fiszki (z generatora AI i ręczne) były od razu `due`, więc rosły bez kontroli
i mieszały się z zaplanowanymi powtórkami FSRS. Potrzebne jest miejsce, w którym
nowe karty czekają na włączenie do nauki, oraz limit aktywnych kart, żeby sesje
powtórek pozostały wykonalne.

## Decyzja

- `Flashcard` dostaje pole `isActive: Boolean @default(false)`.
  `isActive = false` oznacza Inbox, `isActive = true` — aktywną naukę.
- Nowe fiszki lądują w Inboxie (`isActive = false`).
- Zapytanie o karty due (`listDueByUser`) ignoruje Inbox (`isActive = true`).
- Jednorazowa migracja (`20261026000000_add_inbox_to_flashcards`) przenosi do
  Inboxa dokładnie karty nigdy nieoceniane (`reps = 0 AND lastReviewAt IS NULL`).
  Karty oceniane zostają aktywne bez zmian — grandfathering, także powyżej 100
  (migracja nie stosuje limitu). Migracja jest odwracalna
  (`DROP INDEX …; ALTER TABLE "Flashcard" DROP COLUMN "isActive";`).
- Limit aktywnych kart na użytkownika: `ACTIVE_FLASHCARDS_LIMIT = 100`
  (egzekucja w ticketach 03/04/05, nie w migracji).
- Helpery repo (`src/server/flashcards/service.ts`, implementacja Prisma
  w `prisma-flashcards.ts`):
  - `listUserInboxFlashcards(userId, deps)` — Inbox użytkownika, najstarsze pierwsze.
  - `activateOldestInboxCard(userId, deps)` — aktywuje najstarszą kartę z Inboxa
    (FIFO), ustawia `dueAt = now`; zwraca błąd, gdy Inbox jest pusty.
  - Poziom repo: `listInboxByUser(userId)`, `activateInboxCardByUser({ userId, flashcardId, dueAt })`
    (aktywuje tylko kartę z Inboxa; dla aktywnej zwraca `null`).
  - `shouldBackfillToInbox({ reps, lastReviewAt })` — predykat backfillu
    współdzielony z migracją SQL.

## Konsekwencje

- Tickety 03/04/05 budują na `isActive`, `listUserInboxFlashcards`
  i `activateOldestInboxCard`; due nigdy nie zawiera Inboxa.
- Istniejący użytkownicy z >100 ocenionymi kartami zachowują je wszystkie
  (grandfathering) — limit dotyczy tylko nowych aktywacji.
- Nowy indeks `[userId, isActive]` pokrywa listowanie Inboxa.

## Rollback

Prisma nie wykonuje down automatycznie — rollback to ręczne wykonanie komentarza
`Down migration` z `migration.sql` (`DROP INDEX …; ALTER TABLE "Flashcard" DROP COLUMN "isActive";`).
UP/DOWN zweryfikowano na czystej bazie (seed: 2× nieoceniane → Inbox, 1× `reps = 5`
+ 1× `reps = 250` → aktywne; re-UP po DOWN odtwarza ten sam podział).

## Odrzucone alternatywy

- Osobna tabela `InboxCard` zamiast flagi — odrzucona: duplikowałaby schemat
  fiszki i wymagała przenoszenia wierszy między tabelami przy aktywacji.
- Status enum (`INBOX / ACTIVE`) zamiast boola — odrzucony: dwa stany nie
  uzasadniają enuma; bool jest prostszy i tańszy w migracji.
- Domyślna aktywność nowych kart (`isActive @default(true)`) — odrzucona:
  przeczy celowi Inboxa jako lądowiska; nowe karty mają czekać na aktywację.
- Backfill po `state = NEW` zamiast `reps/lastReviewAt` — odrzucony: `state`
  jest pochodną FSRS i mniej wiarygodnie mówi, czy karta była oceniana.
- Stosowanie limitu 100 już w migracji (dezaktywacja nadwyżki) — odrzucone:
  niszczyłoby istniejący plan nauki; zamiast tego grandfathering.
