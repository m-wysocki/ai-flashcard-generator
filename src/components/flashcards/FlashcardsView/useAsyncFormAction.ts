"use client";

import { useState, useTransition } from "react";
import type { FlashcardActionState } from "@/server/flashcards/actions";
import type { MutateFlashcardAction } from "./types";

type UseAsyncFormActionOptions = {
  onSuccess?: (result: FlashcardActionState) => void;
};

export function useAsyncFormAction(
  action: MutateFlashcardAction,
  options?: UseAsyncFormActionOptions,
) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<FlashcardActionState | null>(null);

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      setState(result);
      if (result.ok) {
        options?.onSuccess?.(result);
      }
    });
  }

  return {
    pending: isPending,
    state,
    submit,
  };
}
