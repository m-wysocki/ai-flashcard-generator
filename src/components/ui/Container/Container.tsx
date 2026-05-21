import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
};

export function Container({ children }: ContainerProps) {
  return (
    <div
      data-ui="Container"
      className="mx-auto w-full max-w-3xl px-4"
    >
      {children}
    </div>
  );
}
