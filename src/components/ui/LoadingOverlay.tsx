import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type LoadingOverlayProps = {
  isLoading: boolean;
  children: ReactNode;
  label?: string;
  className?: string;
};

export const LoadingOverlay = ({
  isLoading,
  children,
  label = "Loading",
  className,
}: LoadingOverlayProps) => {
  return (
    <div data-ui="LoadingOverlay" className={cn("relative", className)} aria-busy={isLoading}>
      {children}
      {isLoading ? (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-lg bg-white/60 backdrop-blur-[1px]">
          <Spinner label={label} />
        </div>
      ) : null}
    </div>
  );
};
