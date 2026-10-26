"use client";

import { appCopy } from "@/content/app-copy";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useAsyncFormAction } from "./useAsyncFormAction";
import type { FlashcardsCopyLanguage, MutateFlashcardAction } from "./types";

type InboxActivateButtonProps = {
  flashcardId: string;
  activateFlashcardAction: MutateFlashcardAction;
  disabled?: boolean;
  language: FlashcardsCopyLanguage;
  onActivated?: () => void;
};

export function InboxActivateButton({
  flashcardId,
  activateFlashcardAction,
  disabled,
  language,
  onActivated,
}: InboxActivateButtonProps) {
  const copy = appCopy[language].flashcards;
  const { refresh } = useNavigation();
  const { state, submit } = useAsyncFormAction(activateFlashcardAction, {
    onSuccess: () => {
      onActivated?.();
      refresh();
    },
  });

  return (
    <div className="mt-2">
      <form action={submit}>
        <input type="hidden" name="flashcardId" value={flashcardId} />
        <input type="hidden" name="language" value={language} />
        <SubmitButton
          size="sm"
          color="tertiary"
          pendingLabel={copy.inboxActivating}
          disabled={disabled}
        >
          {copy.inboxActivate}
        </SubmitButton>
      </form>
      {state && !state.ok ? (
        <p role="alert" className="mt-1 text-sm text-[var(--color-danger)]">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
