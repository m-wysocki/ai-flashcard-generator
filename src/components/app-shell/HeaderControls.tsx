"use client";

import type { UiLanguage } from "@/content/app-copy";
import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { AccountDropdown } from "./AccountDropdown";
import { SegmentedSwitch } from "@/components/ui/SegmentedSwitch/SegmentedSwitch";

type HeaderControlsProps = {
  email?: string;
  onLanguageChange?: (language: UiLanguage) => void;
};

export function HeaderControls({ email, onLanguageChange }: HeaderControlsProps) {
  const { language, setLanguage } = useUiLanguage();
  const copy = appCopy[language].common;

  const handleLanguageChange = (nextLanguage: UiLanguage) => {
    setLanguage(nextLanguage);
    onLanguageChange?.(nextLanguage);
  };

  return (
    <div data-ui="HeaderControls" className="flex items-center gap-3">
      <SegmentedSwitch
        ariaLabel={copy.uiLanguageLabel}
        value={language}
        onChange={handleLanguageChange}
        className="h-10"
        options={[
          { value: "pl", label: copy.languagePl },
          { value: "en", label: copy.languageEn },
        ]}
      />
      {email ? <AccountDropdown email={email} /> : null}
    </div>
  );
}
