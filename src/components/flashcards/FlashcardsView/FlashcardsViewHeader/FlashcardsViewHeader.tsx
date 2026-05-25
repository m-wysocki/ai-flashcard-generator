import { Plus } from "lucide-react";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { StatList } from "@/components/ui/StatList";

const addIcon = <Plus size={16} />;

type StatItem = {
  label: string;
  value: string | number;
};

type FlashcardsViewHeaderProps = {
  title: string;
  addLabel: string;
  onAddClick: () => void;
  statItems: StatItem[];
};

export function FlashcardsViewHeader({
  title,
  addLabel,
  onAddClick,
  statItems,
}: FlashcardsViewHeaderProps) {
  return (
    <div data-ui="FlashcardsViewHeader" className="grid gap-1 border-b-2 border-[var(--color-border)] pb-4">
      <div className="flex items-center justify-between">
        <Heading as="h1" size="md">
          {title}
        </Heading>
        <Button
          type="button"
          color="ghost"
          icon={addIcon}
          onClick={onAddClick}
        >
          {addLabel}
        </Button>
      </div>
      <StatList items={statItems} />
    </div>
  );
}
