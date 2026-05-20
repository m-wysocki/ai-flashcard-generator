"use client";

import { createContext, useCallback, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";

type NavigationContextValue = {
  isPending: boolean;
  navigate: (href: string) => void;
  refresh: () => void;
};

const NavigationContext = createContext<NavigationContextValue>({
  isPending: false,
  navigate: () => {},
  refresh: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router, startTransition],
  );

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [startTransition]);

  return (
    <NavigationContext value={{ isPending, navigate, refresh }}>
      {children}
    </NavigationContext>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
