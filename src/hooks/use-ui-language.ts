"use client";

import { useEffect, useState } from "react";
import type { UiLanguage } from "@/content/app-copy";

const UI_LANGUAGE_KEY = "ui-language";
const UI_LANGUAGE_EVENT = "ui-language-change";

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
    window.dispatchEvent(new CustomEvent<UiLanguage>(UI_LANGUAGE_EVENT, { detail: nextLanguage }));
  };

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === UI_LANGUAGE_KEY) {
        setLanguageState(event.newValue === "en" ? "en" : "pl");
      }
    };
    const handleLanguageEvent = (event: Event) => {
      const languageEvent = event as CustomEvent<UiLanguage>;
      setLanguageState(languageEvent.detail === "en" ? "en" : "pl");
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(UI_LANGUAGE_EVENT, handleLanguageEvent);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(UI_LANGUAGE_EVENT, handleLanguageEvent);
    };
  }, []);

  return { language, setLanguage };
}
