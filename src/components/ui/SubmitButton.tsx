"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import { Button } from "./Button/Button";
import { Spinner } from "./Spinner";

type SubmitButtonProps = Omit<ComponentProps<typeof Button>, "type"> & {
  pendingLabel?: string;
  pending?: boolean;
};

export const SubmitButton = ({
  children,
  disabled,
  pending,
  pendingLabel = "Saving...",
  ...props
}: SubmitButtonProps) => {
  const { pending: formPending } = useFormStatus();
  const isPending = pending ?? formPending;

  return (
    <Button
      data-ui="SubmitButton"
      type="submit"
      disabled={disabled || isPending}
      aria-busy={isPending}
      {...props}
    >
      {isPending ? (
        <>
          <Spinner label={pendingLabel} />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
};
