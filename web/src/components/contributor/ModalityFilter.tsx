"use client";

import { Button, HStack } from "@chakra-ui/react";
import { MODALITIES, MODALITY_LABELS, type Modality } from "@/config/constants";

type Props = {
  value: Modality | null;
  onChange: (value: Modality | null) => void;
};

export function ModalityFilter({ value, onChange }: Props) {
  const options: Array<{ key: string; label: string; next: Modality | null }> =
    [
      { key: "all", label: "All", next: null },
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
            size="xs"
            variant="outline"
            borderColor={active ? "brand.500" : "border"}
            color={active ? "brand.fg" : "fg.muted"}
            bg={active ? "brand.subtle" : "transparent"}
            onClick={() => onChange(option.next)}
            _hover={{ color: "fg", borderColor: "border.emphasized" }}
          >
            {option.label}
          </Button>
        );
      })}
    </HStack>
  );
}
