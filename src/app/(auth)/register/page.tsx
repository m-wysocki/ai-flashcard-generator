import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading/Heading";
import { registerAction } from "@/server/auth/actions";
import { AuthForm } from "../AuthForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md items-center px-4 py-8">
      <Card className="w-full grid gap-5 p-5">
        <header className="grid gap-2">
          <Heading as="h1" size="sm" className="text-xl leading-7">
            Register
          </Heading>
          <p className="text-sm text-[var(--color-muted)]">
            Create an account with the private invite code.
          </p>
        </header>
        <AuthForm action={registerAction} submitLabel="Create account" includeInviteCode />
        <p className="text-sm text-[var(--color-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[var(--color-primary)]">
            Login
          </Link>
        </p>
      </Card>
    </main>
  );
}
