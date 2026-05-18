import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";
import type { Material } from "./types";

type GeneratedExamplesListProps = {
  material: Material;
  selectedExampleIndex: number | null;
  onSelect: (index: number) => void;
  examplesLabel: string;
  notesLabel: string;
  noNotesLabel: string;
  selectLabel: string;
  noExamplesLabel: string;
};

export function GeneratedExamplesList({
  material,
  selectedExampleIndex,
  onSelect,
  examplesLabel,
  notesLabel,
  noNotesLabel,
  selectLabel,
  noExamplesLabel,
}: GeneratedExamplesListProps) {
  if (material.examples.length === 0) {
    return <EmptyState title={noExamplesLabel} />;
  }

  return (
    <div className="grid gap-3">
      <Panel className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {examplesLabel}
        </p>
        <ul className="grid gap-2 text-sm">
          {material.examples.map((example, index) => (
            <li key={`${example.english}-${index}`}>
              <p>{example.english}</p>
              <p className="text-[var(--color-muted)]">{example.polish}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-[var(--color-muted)]">
          {notesLabel}: {material.notes ?? noNotesLabel}
        </p>
      </Panel>
      <ul className="grid gap-3">
        {material.examples.map((example, index) => {
          const isSelected = selectedExampleIndex === index;
          return (
            <li
              key={`${example.english}-select-${index}`}
              className="grid gap-2 rounded-lg border-[var(--border-strong)] border-[var(--color-border)] p-3"
            >
              <p>{example.polish}</p>
              <p className="font-semibold">{example.english}</p>
              <Button
                type="button"
                variant={isSelected ? "inverted" : "primary"}
                onClick={() => onSelect(index)}
              >
                {selectLabel}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
