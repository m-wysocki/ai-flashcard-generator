export function buildSessionSubtitle(
  count: number,
  copy: {
    sessionSubtitleCards: string;
    sessionSubtitleApprox: string;
    sessionSubtitleMinutes: string;
  },
) {
  const minutes = Math.max(1, Math.round(count * 0.5));
  return `${count} ${copy.sessionSubtitleCards} · ${copy.sessionSubtitleApprox} ${minutes} ${copy.sessionSubtitleMinutes}`;
}
