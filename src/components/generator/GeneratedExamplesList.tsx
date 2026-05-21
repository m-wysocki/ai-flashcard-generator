import { Check, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShadowFrame } from "@/components/ui/ShadowFrame/ShadowFrame";
import { cn } from "@/lib/cn";

type Example = { english: string; polish: string; note: string | null };

type GeneratedExamplesListProps = {
  examples: Example[];
  savedIndices: Set<number>;
  onSelect: (example: Example, index: number) => void;
  selectLabel: string;
  savedLabel: string;
  noExamplesLabel: string;
};

export function GeneratedExamplesList({
  examples,
  savedIndices,
  onSelect,
  selectLabel,
  savedLabel,
  noExamplesLabel,
}: GeneratedExamplesListProps) {
  if (examples.length === 0) {
    return <EmptyState title={noExamplesLabel} />;
  }

  return (
    <ul data-ui="GeneratedExamplesList" className="grid gap-3">
      {examples.map((example, index) => {
        const saved = savedIndices.has(index);

        return (
          <ShadowFrame
            as="article"
            key={`${example.english}-${index}`}
            className="grid gap-2 p-3"
          >
            <p className="text-sm text-[var(--color-muted)]">{example.polish}</p>
            <p className="font-semibold">{example.english}</p>

            {example.note ? (
              <p
                className={cn(
                  "flex items-start gap-1.5 text-xs",
                  "text-[var(--color-muted)]",
                )}
              >
                <Info size={12} className="mt-0.5 shrink-0" aria-hidden />
                {example.note}
              </p>
            ) : null}

            <Button
              type="button"
              color={saved ? "success" : "primary"}
              disabled={saved}
              icon={saved ? <Check size={16} /> : <Plus size={16} />}
              onClick={() => onSelect(example, index)}
              className="mt-1"
            >
              {saved ? savedLabel : selectLabel}
            </Button>
          </ShadowFrame>
        );
      })}
    </ul>
  );
}
