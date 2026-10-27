"use client";

import { useSyncExternalStore } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { speakEnglish, stopSpeaking } from "@/components/flashcards/FlashcardsReviewSession/helpers";

type SpeakButtonProps = {
  text: string;
  label: string;
  className?: string;
};

/**
 * Tracks the text passed to the most recent `speakEnglish()` call from this
 * module. Module-level (not React state) so every SpeakButton instance on the
 * page shares it without a provider. A plain string is enough: the toggle
 * decision always pairs it with the live `synth.speaking` flag, so a stale
 * value after natural utterance end is harmless (next click sees
 * `speaking === false` and speaks unconditionally).
 */
let lastSpokenText: string | null = null;

function subscribe() {
  return () => {};
}

function getSpeechSynthesisSnapshot(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Inline TTS button for English text. Reuses the review-session speech
 * engine (`speakEnglish` — Web Speech API, en-US, cancel-before-speak).
 *
 * Toggle/switch behavior: clicking the button whose text is currently being
 * spoken stops playback; clicking a different button cancels the current
 * one and immediately starts the new text. Renders nothing when the
 * Web Speech API is unavailable or `text` is empty/whitespace-only.
 *
 * NOTE: identity is compared by string value, so two rows with identical
 * text are treated as "the same" — clicking the second while the first
 * plays stops playback instead of restarting it.
 */
export function SpeakButton({ text, label, className }: SpeakButtonProps) {
  // Client-only until hydration completes, so SSR output stays null-shaped.
  const supported = useSyncExternalStore(subscribe, getSpeechSynthesisSnapshot, getServerSnapshot);

  if (!supported) return null;
  if (!text.trim()) return null;

  function handleClick() {
    try {
      const synth = window.speechSynthesis;
      if (synth.speaking && lastSpokenText === text) {
        synth.cancel();
        // Also drop a still-pending deferred speak() and the keep-alive
        // ticker: without this, a stop click inside speakEnglish()'s 60 ms
        // defer window would still queue the utterance afterwards.
        stopSpeaking();
        lastSpokenText = null;
        return;
      }
      // Different text (or nothing tracked): speakEnglish() cancels any
      // in-flight utterance itself, then starts the new one.
      lastSpokenText = text;
      speakEnglish(text);
    } catch {
      // TTS is best-effort — never break the surrounding UI.
    }
  }

  return (
    <button
      type="button"
      data-ui="SpeakButton"
      aria-label={label}
      onClick={handleClick}
      className={cn(
        "relative inline-flex h-7 w-7 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full select-none -mt-0.5",
        // 44px+ tap target without changing the icon's visual size.
        "after:absolute after:-inset-3 after:content-['']",
        "text-[var(--color-muted)] transition-colors",
        "hover:bg-black/5 hover:text-[var(--color-text)]",
        "active:bg-black/10 active:text-[var(--color-text)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]",
        className,
      )}
    >
      <Volume2 size={14} aria-hidden />
    </button>
  );
}
