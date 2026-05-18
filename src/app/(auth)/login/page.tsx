import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { loginAction } from "@/server/auth/actions";
import { AuthForm } from "../AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md items-center px-4 py-8">
      <Card className="w-full grid gap-5 p-5">
        <header className="grid gap-2">
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Login</h1>
          <p className="text-sm text-[var(--color-muted)]">Sign in to continue learning.</p>
        </header>
        <AuthForm action={loginAction} submitLabel="Login" />
        <p className="text-sm text-[var(--color-muted)]">
          Need access?{" "}
          <Link href="/register" className="font-semibold text-[var(--color-primary)]">
            Register
          </Link>
        </p>
      </Card>
    </main>
  );
}
