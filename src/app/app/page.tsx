import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell/AppShell";
import { Button } from "@/components/Button/Button";
import { logoutAction } from "@/server/auth/actions";

export default async function AppPage() {
  const session = await auth();

  return (
    <AppShell
      userEmail={session?.user?.email}
      headerAction={
        <form action={logoutAction}>
          <Button type="submit" variant="primary">
            Logout
          </Button>
        </form>
      }
    />
  );
}
