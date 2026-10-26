"use client";

import { appCopy } from "@/content/app-copy";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useAsyncFormAction } from "./useAsyncFormAction";
import type { FlashcardsCopyLanguage, MutateFlashcardAction } from "./types";

type InboxActivateAllButtonProps = {
  activateAllAction: MutateFlashcardAction;
  language: FlashcardsCopyLanguage;
};

export function InboxActivateAllButton({
  activateAllAction,
  language,
}: InboxActivateAllButtonProps) {
  const copy = appCopy[language].flashcards;
  const { refresh } = useNavigation();
  const { state, submit } = useAsyncFormAction(activateAllAction, {
    onSuccess: () => {
      refresh();
    },
  });

  return (
    <div>
      <form action={submit}>
        <input type="hidden" name="language" value={language} />
        <SubmitButton size="sm" color="secondary" pendingLabel={copy.inboxActivating}>
          {copy.inboxActivateAll}
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
