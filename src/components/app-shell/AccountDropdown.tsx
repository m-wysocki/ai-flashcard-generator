"use client";

import { UserRound } from "lucide-react";
import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { logoutAction } from "@/server/auth/actions";
import { Button } from "@/components/ui/Button/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { DropdownButton } from "@/components/ui/DropdownButton/DropdownButton";

type AccountDropdownProps = {
  email: string;
};

export function AccountDropdown({ email }: AccountDropdownProps) {
  const { language } = useUiLanguage();
  const copy = appCopy[language].common;

  return (
    <div data-ui="AccountDropdown">
      <DropdownButton
        trigger={
          <Button
            aria-label={copy.openAccountPanel}
            color="tertiary"
            size="md"
            icon={<UserRound size={16} />}
            className="size-10 p-0 focus-visible:outline-none focus-visible:ring-0"
          />
        }
        contentClassName="w-auto max-w-[calc(100vw-2rem)]"
      >
        <div className="space-y-1">
          <p className="px-2 py-1 text-sm text-[var(--color-text)]">{email}</p>
          <form action={logoutAction}>
            <SubmitButton
              color="ghost"
              size="sm"
              pendingLabel={copy.loggingOut}
              className="w-full justify-start rounded-md px-2"
            >
              {copy.logout}
            </SubmitButton>
          </form>
        </div>
      </DropdownButton>
    </div>
  );
}
