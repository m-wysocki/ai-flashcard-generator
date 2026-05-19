import { UserRound } from "lucide-react";
import { logoutAction } from "@/server/auth/actions";
import { Button } from "@/components/ui/Button/Button";
import { DropdownButton } from "@/components/ui/DropdownButton/DropdownButton";

type AccountDropdownProps = {
  email: string;
};

export function AccountDropdown({ email }: AccountDropdownProps) {
  return (
    <div data-ui="AccountDropdown">
      <DropdownButton
        trigger={
          <Button
            aria-label="Open account panel"
            variant="tertiary"
            size="md"
            iconOnly
            icon={<UserRound size={16} />}
            className="rounded-full focus-visible:outline-none focus-visible:ring-0"
          />
        }
        contentClassName="w-auto max-w-[calc(100vw-2rem)]"
      >
        <div className="space-y-1">
          <p className="px-2 py-1 text-sm text-[var(--color-text)]">{email}</p>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start rounded-md px-2"
            >
              Wyloguj
            </Button>
          </form>
        </div>
      </DropdownButton>
    </div>
  );
}
