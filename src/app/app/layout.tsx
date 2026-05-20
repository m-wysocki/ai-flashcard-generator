import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NavigationProvider } from "@/components/app-shell/NavigationContext";
import { NavigationProgressBar } from "@/components/app-shell/NavigationProgressBar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <NavigationProvider>
      <NavigationProgressBar />
      {children}
    </NavigationProvider>
  );
}
