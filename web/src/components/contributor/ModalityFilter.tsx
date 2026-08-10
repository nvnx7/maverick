"use client";

import { HStack } from "@chakra-ui/react";
import { Button } from "@/components/common/Button";
import { MODALITIES, MODALITY_LABELS, type Modality } from "@/config/constants";

type Props = {
  value: Modality | null;
  onChange: (value: Modality | null) => void;
};

export function ModalityFilter({ value, onChange }: Props) {
  const options: Array<{ key: string; label: string; next: Modality | null }> =
    [
      { key: "all", label: "All Modalities", next: null },
      ...MODALITIES.map((modality) => ({
        key: modality,
        label: MODALITY_LABELS[modality],
        next: modality as Modality | null,
      })),
    ];

  return (
    <HStack gap={2} wrap="wrap">
      {options.map((option) => {
        const active = value === option.next;
        return (
          <Button
            key={option.key}
            size="sm"
            variant={active ? "primary" : "outline"}
            px={4}
            py={2}
            onClick={() => onChange(option.next)}
          >
            {option.label}
          </Button>
        );
      })}
    </HStack>
  );
}
