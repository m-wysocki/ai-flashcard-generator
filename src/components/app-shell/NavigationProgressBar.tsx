"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { useNavigation } from "./NavigationContext";

export function NavigationProgressBar() {
  const { isPending } = useNavigation();
  return <ProgressBar isVisible={isPending} />;
}
