"use client";

import { TabGroup } from "@/components/ui/TabGroup";

export type BuilderItemType = "mcq" | "inline_choice" | "dragdrop" | "hotspot" | "cer" | "punnett";

export function BuilderTypeTabs({
  value,
  onValueChange,
}: {
  value: BuilderItemType;
  onValueChange: (next: BuilderItemType) => void;
}) {
  return (
    <TabGroup
      value={value}
      onValueChange={onValueChange}
      items={[
        { value: "mcq", label: "Multiple Choice" },
        { value: "inline_choice", label: "Inline Choice" },
        { value: "dragdrop", label: "Card Sort" },
        { value: "hotspot", label: "Hotspot" },
        { value: "cer", label: "CER Builder" },
        { value: "punnett", label: "Punnett Square" },
      ]}
    />
  );
}
