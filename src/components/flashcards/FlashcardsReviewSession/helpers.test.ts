import { act } from "@testing-library/react";
import {
  __resetSpeechStateForTests,
  ensureVoicesLoaded,
  speakEnglish,
  stopSpeaking,
  unlockSpeechIfNeeded,
} from "./helpers";

type MockVoice = Pick<
  SpeechSynthesisVoice,
  "lang" | "name" | "localService"
>;

function makeVoice(
  lang: string,
  name: string,
  localService = false,
): MockVoice {
  return { lang, name, localService };
}

function makeSynth(voices: MockVoice[] = []) {
  const listeners = new Map<string, EventListener>();
  return {
    speak: jest.fn(),
    cancel: jest.fn(),
    resume: jest.fn(),
    speaking: false,
    pending: false,
    paused: false,
    getVoices: jest.fn().mockReturnValue(voices),
    addEventListener: jest.fn(
      (type: string, listener: EventListener, _options?: unknown) => {
        listeners.set(type, listener);
      },
    ),
    removeEventListener: jest.fn(),
    __listeners: listeners,
  };
}

function installSpeech(synth: ReturnType<typeof makeSynth>) {
  Object.defineProperty(window, "speechSynthesis", {
    value: synth,
    configurable: true,
    writable: true,
  });
}

let utteranceInstances: Array<Record<string, unknown>> = [];

beforeEach(() => {
  __resetSpeechStateForTests();
  utteranceInstances = [];
  global.SpeechSynthesisUtterance = jest
    .fn()
    .mockImplementation((text: string) => {
      const instance: Record<string, unknown> = { text };
      utteranceInstances.push(instance);
      return instance;
    }) as never;
  jest.useFakeTimers();
  jest.spyOn(console, "debug").mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("speakEnglish (iOS PWA fix)", () => {
  it("cancels + resumes synchronously but defers speak() past the cancel tick", async () => {
    const synth = makeSynth();
    installSpeech(synth);

    speakEnglish("hello");

    expect(synth.cancel).toHaveBeenCalled();
    expect(synth.resume).toHaveBeenCalled();
    // Unlock speaks an empty utterance synchronously; the real text must
    // not be queued in the same tick (iOS drops same-tick speak()).
    expect(
      synth.speak.mock.calls.some(
        (c) => (c[0] as { text?: string }).text === "hello",
      ),
    ).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(60);
    });

    expect(synth.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: "hello" }),
    );
  });

  it("unlocks the engine only once per session", async () => {
    const synth = makeSynth();
    installSpeech(synth);

    speakEnglish("one");
    await act(async () => {
      jest.advanceTimersByTime(60);
    });
    speakEnglish("two");
    await act(async () => {
      jest.advanceTimersByTime(60);
    });

    const emptySpeaks = synth.speak.mock.calls.filter(
      (c) => (c[0] as { text?: string }).text === "",
    );
    expect(emptySpeaks).toHaveLength(1);
    expect(synth.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: "one" }),
    );
    expect(synth.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: "two" }),
    );
  });

  it("unlockSpeechIfNeeded is idempotent when called directly", () => {
    const synth = makeSynth();
    unlockSpeechIfNeeded(synth as never);
    unlockSpeechIfNeeded(synth as never);
    const emptySpeaks = synth.speak.mock.calls.filter(
      (c) => (c[0] as { text?: string }).text === "",
    );
    expect(emptySpeaks).toHaveLength(1);
  });

  it("ignores blank text without touching the engine", async () => {
    const synth = makeSynth();
    installSpeech(synth);

    speakEnglish("   ");
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(synth.cancel).not.toHaveBeenCalled();
    expect(synth.speak).not.toHaveBeenCalled();
  });

  it("emits console.debug diagnostics around speak()", async () => {
    const synth = makeSynth();
    installSpeech(synth);

    speakEnglish("hello");
    await act(async () => {
      jest.advanceTimersByTime(60);
    });

    expect(console.debug).toHaveBeenCalledWith(
      "[TTS] speak()",
      expect.objectContaining({ text: "hello" }),
    );
    expect(console.debug).toHaveBeenCalledWith(
      "[TTS] speak() queued",
      expect.anything(),
    );
  });

  it("prefers a localService en-US voice, then local en, then en-US, then en", async () => {
    const localEnUs = makeVoice("en-US", "local-us", true);
    const remoteEnUs = makeVoice("en-US", "remote-us", false);
    const localEnGb = makeVoice("en-GB", "local-gb", true);
    const remoteEnGb = makeVoice("en-GB", "remote-gb", false);

    // Local en-US wins over everything.
    const synth = makeSynth([remoteEnUs, localEnGb, localEnUs, remoteEnGb]);
    installSpeech(synth);
    speakEnglish("hi");
    await act(async () => {
      jest.advanceTimersByTime(60);
    });
    const queued = synth.speak.mock.calls.map((c) => c[0]) as Array<{
      text?: string;
      voice?: MockVoice;
    }>;
    const real = queued.find((u) => u.text === "hi");
    expect(real?.voice).toBe(localEnUs);

    // Without a local en-US, a local en-GB wins over remote en-US.
    __resetSpeechStateForTests();
    const synth2 = makeSynth([remoteEnUs, remoteEnGb, localEnGb]);
    installSpeech(synth2);
    speakEnglish("hi");
    await act(async () => {
      jest.advanceTimersByTime(60);
    });
    const real2 = (synth2.speak.mock.calls.map((c) => c[0]) as Array<{
      text?: string;
      voice?: MockVoice;
    }>).find((u) => u.text === "hi");
    expect(real2?.voice).toBe(localEnGb);

    // Without any local voice, en-US wins over other en- voices.
    __resetSpeechStateForTests();
    const synth3 = makeSynth([remoteEnGb, remoteEnUs]);
    installSpeech(synth3);
    speakEnglish("hi");
    await act(async () => {
      jest.advanceTimersByTime(60);
    });
    const real3 = (synth3.speak.mock.calls.map((c) => c[0]) as Array<{
      text?: string;
      voice?: MockVoice;
    }>).find((u) => u.text === "hi");
    expect(real3?.voice).toBe(remoteEnUs);
  });

  it("caches voices and attaches the voiceschanged listener exactly once", () => {
    const synth = makeSynth([]);
    ensureVoicesLoaded(synth as never);
    ensureVoicesLoaded(synth as never);
    expect(synth.addEventListener).toHaveBeenCalledTimes(1);
    expect(synth.addEventListener).toHaveBeenCalledWith(
      "voiceschanged",
      expect.any(Function),
      { once: true },
    );

    // Late-arriving voices (iOS PWA startup) refresh the cache.
    const late = [makeVoice("en-US", "late-us", true)];
    synth.getVoices.mockReturnValue(late);
    synth.__listeners.get("voiceschanged")?.call(synth, new Event("x"));
    expect(ensureVoicesLoaded(synth as never)).toEqual(late);
  });

  it("keep-alive resumes unconditionally every 10s and stops on utterance end", async () => {
    const synth = makeSynth();
    installSpeech(synth);

    speakEnglish("long text");
    await act(async () => {
      jest.advanceTimersByTime(60);
    });

    expect(synth.resume).toHaveBeenCalledTimes(1); // sync unblock only
    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });
    expect(synth.resume).toHaveBeenCalledTimes(2);
    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });
    expect(synth.resume).toHaveBeenCalledTimes(3);

    // End the utterance — the interval must stop.
    const real = utteranceInstances.find((u) => u.text === "long text") as
      | { onend?: (ev: unknown) => void }
      | undefined;
    expect(real?.onend).toEqual(expect.any(Function));
    await act(async () => {
      real?.onend?.({});
    });
    const afterEnd = synth.resume.mock.calls.length;
    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });
    expect(synth.resume.mock.calls.length).toBe(afterEnd);
    expect(console.debug).toHaveBeenCalledWith(
      "[TTS] utterance ended",
      expect.anything(),
    );
  });

  it("rapid double speakEnglish() queues only one utterance", async () => {
    const synth = makeSynth();
    installSpeech(synth);

    // Two clicks inside the 60 ms defer window: the second call must drop
    // the first call's pending timeout instead of stacking a second speak().
    speakEnglish("hello");
    speakEnglish("hello");
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    const real = synth.speak.mock.calls.filter(
      (c) => (c[0] as { text?: string }).text === "hello",
    );
    expect(real).toHaveLength(1);
  });

  it("stopSpeaking() inside the 60 ms window prevents speak() entirely", async () => {
    const synth = makeSynth();
    installSpeech(synth);

    speakEnglish("hello");
    stopSpeaking();
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(
      synth.speak.mock.calls.some(
        (c) => (c[0] as { text?: string }).text === "hello",
      ),
    ).toBe(false);
  });

  it("stopSpeaking() leaves no live keep-alive timers after cancel() without onend", async () => {
    const synth = makeSynth();
    installSpeech(synth);

    speakEnglish("long text");
    await act(async () => {
      jest.advanceTimersByTime(60);
    });
    expect(synth.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: "long text" }),
    );

    // Stop click: synth.cancel() fires no onend on most engines — the
    // keep-alive ticker must still die (no resume ticks, no live timers).
    const timersBeforeStop = jest.getTimerCount();
    stopSpeaking();
    expect(synth.cancel).toHaveBeenCalled();
    // Exactly the 2 keep-alive timers (interval + 60 s cap) are gone.
    // (Absolute 0 is not asserted: `act()` itself may hold a timer.)
    expect(jest.getTimerCount()).toBe(timersBeforeStop - 2);

    const resumes = synth.resume.mock.calls.length;
    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });
    expect(synth.resume.mock.calls.length).toBe(resumes);
  });

  it("re-clicking replaces the keep-alive instead of stacking intervals", async () => {
    const synth = makeSynth();
    installSpeech(synth);

    speakEnglish("one");
    await act(async () => {
      jest.advanceTimersByTime(60);
    });
    // Second utterance without the first ever ending (cancel() fires no
    // onend): only one ticker may survive.
    speakEnglish("two");
    await act(async () => {
      jest.advanceTimersByTime(60);
    });

    const base = synth.resume.mock.calls.length;
    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });
    // Exactly one keep-alive tick — two stacked intervals would resume twice.
    expect(synth.resume.mock.calls.length).toBe(base + 1);
  });

  it("clears the keep-alive interval after the 60s cap", async () => {
    const synth = makeSynth();
    installSpeech(synth);

    speakEnglish("long text");
    await act(async () => {
      jest.advanceTimersByTime(60);
    });
    const syncCalls = synth.resume.mock.calls.length;

    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    // ~6 keep-alive ticks in 60s (10s cadence).
    expect(synth.resume.mock.calls.length).toBeGreaterThan(syncCalls);

    const frozen = synth.resume.mock.calls.length;
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(synth.resume.mock.calls.length).toBe(frozen);
  });
});
