"use client";

import { useState } from "react";
import type { UiLanguage } from "@/content/app-copy";

const UI_LANGUAGE_KEY = "ui-language";

function getInitialLanguage(): UiLanguage {
  if (typeof window === "undefined") {
    return "pl";
  }

  return window.localStorage.getItem(UI_LANGUAGE_KEY) === "en" ? "en" : "pl";
}

export function useUiLanguage() {
  const [language, setLanguageState] = useState<UiLanguage>(() => getInitialLanguage());

  const setLanguage = (nextLanguage: UiLanguage) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(UI_LANGUAGE_KEY, nextLanguage);
  };

  return { language, setLanguage };
}

