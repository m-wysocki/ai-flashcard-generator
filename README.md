# ai-flashcard-generator

## Local Setup

Use Node from `.nvmrc`:

```bash
nvm use
npm install
```

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

## Environment Variables

### `DATABASE_URL`

Required for the app runtime and Prisma.

Use one of these:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_flashcard_generator"
```

For Neon, use the pooled connection string here. The host usually contains `-pooler`.

It should look like:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DBNAME?channel_binding=require&sslmode=require"
```

Do not commit `.env`.

### `AUTH_SECRET`

Required by Auth.js for signing session/auth cookies.

Generate a local value with:

```bash
npx auth secret
```

### `DATABASE_URL_UNPOOLED`

Used by Prisma CLI and migrations when using Neon. If this is not set, Prisma falls back to `DATABASE_URL`.

For Neon, use the direct connection string here. The host usually does not contain `-pooler`.

```env
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/DBNAME?sslmode=require"
```

### `INVITE_CODE`

Optional for app startup. Required only when registration should be enabled.

If missing or empty, registration is disabled, but login/existing app access should still work.

```env
INVITE_CODE="MATWYS"
```

### `OPENAI_API_KEY`

Optional for app startup. Required only when AI generation should work.

If missing or empty, only the generator should fail gracefully. The rest of the app should still start.

```env
OPENAI_API_KEY="sk-..."
```

### `OPENAI_MODEL`

Optional. Defaults to `gpt-4.1-mini`.

```env
OPENAI_MODEL="gpt-4.1-mini"
```

## Checking The Current Foundation

Without a real database connection you can still run:

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
npm run build
npm run db:generate
```

To validate the Prisma schema with the same connection setup used by migrations, provide `DATABASE_URL_UNPOOLED`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/ai_flashcard_generator" DATABASE_URL_UNPOOLED="postgresql://user:password@localhost:5432/ai_flashcard_generator" npm run db:validate
```

To actually apply migrations, you need a reachable PostgreSQL database:

```bash
npm run db:migrate
```

## Local PostgreSQL Option

If you do not want to create Neon yet, run a local PostgreSQL database with Docker:

```bash
docker run --name ai-flashcard-postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ai_flashcard_generator \
  -p 5432:5432 \
  -d postgres:16
```

Then use:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_flashcard_generator"
```

and run:

```bash
npm run db:migrate
```

## Development Server

```bash
npm run dev
```

Open `http://localhost:3000`.
