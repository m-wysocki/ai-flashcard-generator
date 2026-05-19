"use client";

import { useState } from "react";
import type { FlashcardActionState } from "@/server/flashcards/actions";
import type { MutateFlashcardAction } from "./types";

type UseAsyncFormActionOptions = {
  onSuccess?: (result: FlashcardActionState) => void;
};

export function useAsyncFormAction(
  action: MutateFlashcardAction,
  options?: UseAsyncFormActionOptions,
) {
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<FlashcardActionState | null>(null);

  async function submit(formData: FormData) {
    setPending(true);
    const result = await action(formData);
    setState(result);
    if (result.ok) {
      options?.onSuccess?.(result);
    }
    setPending(false);
  }

  return {
    pending,
    state,
    submit,
  };
}
