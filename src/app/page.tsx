import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Panel } from "@/components/ui/Panel";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.email) {
    redirect("/app");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold tracking-wide text-[var(--color-muted)]">
          AI Flashcard Generator
        </span>
        <nav className="flex items-center gap-2" aria-label="Account">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="primary">
            <Link href="/register">Request access</Link>
          </Button>
        </nav>
      </header>

      <section className="grid gap-4">
        <Badge variant="accent" className="w-fit">
          Invite-only English learning
        </Badge>
        <h1 className="max-w-2xl text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          English practice for Polish speakers, built around real language moments.
        </h1>
        <p className="max-w-2xl text-sm text-[var(--color-muted)] sm:text-base">
          Generate natural English phrasing, save one flashcard at a time, then review due cards
          with spaced repetition.
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          Registration requires a valid invite code.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="primary">
            <Link href="/register">Request access</Link>
          </Button>
          <Button asChild>
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>
      </section>

      <Panel className="grid gap-3 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          How it works
        </p>
        <ul className="grid gap-2 text-sm text-[var(--color-text)]">
          <li>1. Add a Polish thought or an English phrase.</li>
          <li>2. Get structured examples and meanings.</li>
          <li>3. Save one polished flashcard and review it later.</li>
        </ul>
      </Panel>

      <footer className="mt-auto text-xs text-[var(--color-muted)]">
        Access is restricted to registered users with invite-code registration.
      </footer>
    </main>
  );
}
