import { SurfacePanel } from "@/components/SurfacePanel/SurfacePanel";
import styles from "./LearningPreview.module.scss";

type LearningPreviewProps = {
  "aria-label": string;
  inputLabel: string;
  inputText: string;
  modeLabel: string;
  outputLabel: string;
  outputText: string;
  flashcardFront?: string;
  flashcardBack?: string;
};

export function LearningPreview({
  "aria-label": ariaLabel,
  inputLabel,
  inputText,
  modeLabel,
  outputLabel,
  outputText,
  flashcardFront,
  flashcardBack,
}: LearningPreviewProps) {
  return (
    <SurfacePanel as="aside" className={styles.LearningPreview} aria-label={ariaLabel}>
      <PreviewHeader title={inputLabel} meta={modeLabel} />
      <PreviewBlock tone="muted" text={inputText} />
      <PreviewBlock label={outputLabel} text={outputText} variant="result" />
      {flashcardFront && flashcardBack ? (
        <FlashcardPreview front={flashcardFront} back={flashcardBack} />
      ) : null}
    </SurfacePanel>
  );
}

function PreviewHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className={styles.LearningPreviewHeader}>
      <span>{title}</span>
      <span>{meta}</span>
    </div>
  );
}

function PreviewBlock({
  label,
  text,
  tone,
  variant,
}: {
  label?: string;
  text: string;
  tone?: "muted";
  variant?: "result";
}) {
  const classes = [
    styles.LearningPreviewBlock,
    tone === "muted" ? styles.LearningPreviewBlockMuted : null,
    variant === "result" ? styles.LearningPreviewBlockResult : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {label ? <span className={styles.LearningPreviewLabel}>{label}</span> : null}
      <p>{text}</p>
    </div>
  );
}

function FlashcardPreview({ front, back }: { front: string; back: string }) {
  return (
    <div className={styles.LearningPreviewFlashcard}>
      <span>Flashcard preview</span>
      <strong>{front}</strong>
      <p>{back}</p>
    </div>
  );
}
