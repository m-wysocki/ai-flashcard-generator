# AI Language Learning App — Project Guidelines

## 🎯 Project Goal

Build a fullstack AI-powered language learning application.

Main idea:

* User enters a Polish/English word, phrase, or sentence
* AI generates:
    * English/Polish translations
    * multiple natural variations in English
    * example sentences in English
* User can save selected examples as flashcards
* App uses spaced repetition (FSRS) to schedule learning sessions

The project should:

* demonstrate modern fullstack skills
* showcase Node.js backend knowledge
* avoid unnecessary overengineering
* be portfolio-ready

---

# 🧱 Tech Stack

## Frontend & Backend

```txt
Next.js (App Router)
TypeScript
```

Use:

* Server Components where possible
* Server Actions for mutations
* Route Handlers for API endpoints

The application should remain a monolithic fullstack app.
Do not create a separate backend service unless truly necessary.

---

# 🖥️ Backend Responsibilities

Next.js backend handles:

* authentication
* OpenAI communication
* flashcards CRUD
* spaced repetition logic
* protected routes
* validation
* business logic

---

# 🗄️ Database

## Database Provider

```txt
Neon PostgreSQL
```

## ORM

```txt
Prisma
```

Requirements:

* use migrations
* keep schema clean and normalized
* avoid unnecessary complexity

---

# 🔐 Authentication

## Stack

```txt
Auth.js (NextAuth)
Credentials Provider
bcrypt
```

## Authentication Flow

Use:

* email + password login
* database sessions
* secure cookies

Passwords:

* must be hashed with bcrypt
* must NEVER be stored in plain text

Use generic auth error messages:

```txt
Incorrect email or password
```

Do not reveal whether the email exists.

---

# 🤖 AI Integration

## Provider

```txt
OpenAI API
```

Communication with OpenAI must happen ONLY on the server side.

Never expose API keys to the frontend.

Use structured JSON responses whenever possible.

Example response structure:

```ts
{
  translations: string[];
  examples: {
    sentence: string;
    translation: string;
  }[];
}
```

---

# 🧠 Flashcards & Learning System

Use:

```txt
FSRS (Free Spaced Repetition Scheduler)
```

Features:

* save flashcards
* review sessions
* learning progress
* due dates
* difficulty tracking

---

# 🎨 UI Stack

```txt
Tailwind CSS
Radix UI
```

Guidelines:

* clean and minimal UI
* accessible components
* responsive layout
* avoid overdesign

---

# ✅ Validation

Use:

```txt
Zod
```

Validate:

* forms
* API payloads
* auth input
* AI responses

---

# 🚀 Deployment

## Hosting

```txt
Vercel
```

## Database

```txt
Neon
```

---

# 🔄 CI/CD

Optional but recommended:

```txt
GitHub Actions
```

Suggested checks:

* lint
* typecheck
* tests

---

# 🧩 Suggested Features

## Core MVP

### AI Chat

* input Polish/English text
* generate English/Polish translations
* generate multiple natural alternatives in English
* generate example sentences in English

### Flashcards

* save examples
* create review queue
* spaced repetition scheduling

### Authentication

* register
* login
* logout
* protected routes

### Dashboard

* flashcards list
* review stats
* learning progress

---

# 📁 Suggested Architecture

```txt
app/
components/
features/
lib/
server/
prisma/
```

Recommended separation:

* UI components
* business logic
* database access
* AI integration
* auth logic

---

# 🧠 Architectural Decisions

## Why no separate backend?

The application uses Next.js Route Handlers and Server Actions because:

* backend logic is tightly coupled to the web app
* project scope does not require independent scaling
* simpler architecture improves maintainability

Avoid unnecessary microservices or enterprise patterns.

---

# 📌 Engineering Principles

## Prioritize

* simplicity
* maintainability
* type safety
* good UX
* clean architecture

## Avoid

* premature optimization
* overengineering
* unnecessary abstractions
* excessive libraries

---

# 💬 Portfolio Description

> Fullstack AI-powered language learning application built with Next.js, PostgreSQL, Prisma, and Auth.js. The app integrates OpenAI to generate contextual translations and uses spaced repetition algorithms to improve long-term vocabulary retention.
