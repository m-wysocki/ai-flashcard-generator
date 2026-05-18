import { Panel } from "@/components/ui/Panel";

type LearningMaterialPreviewProps = {
  inputLabel: string;
  modeLabel: string;
  outputLabel: string;
  outputText: string;
};

export function LearningMaterialPreview({
  inputLabel,
  modeLabel,
  outputLabel,
  outputText,
}: LearningMaterialPreviewProps) {
  return (
    <Panel className="grid gap-3">
      <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>{inputLabel}</span>
        <span>{modeLabel}</span>
      </div>
      <div className="grid gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {outputLabel}
        </p>
        <p className="whitespace-pre-wrap text-sm text-[var(--color-text)]">{outputText}</p>
      </div>
    </Panel>
  );
}
