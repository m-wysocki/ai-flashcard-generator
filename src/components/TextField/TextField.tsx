import type { InputHTMLAttributes } from "react";
import styles from "./TextField.module.scss";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function TextField({ label, className, ...inputProps }: TextFieldProps) {
  return (
    <label className={styles.TextField}>
      <span className={styles.TextFieldLabel}>{label}</span>
      <input className={[styles.TextFieldInput, className].filter(Boolean).join(" ")} {...inputProps} />
    </label>
  );
}
