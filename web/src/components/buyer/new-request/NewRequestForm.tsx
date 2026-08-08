"use client";

import {
  Box,
  Button,
  Field,
  Input,
  NativeSelect,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateJob } from "@/api/jobs";
import { Panel } from "@/components/common/Panel";
import {
  MAX_JOB_BUDGET,
  MODALITIES,
  MODALITY_LABELS,
  type Modality,
} from "@/config/constants";
import { routes } from "@/config/routes";
import { parseUsdc, formatUsdc } from "@/utils/format";
import { quoteBudget } from "@/utils/quote";

const EXPIRY_DAYS = 30;

export function NewRequestForm() {
  const router = useRouter();
  const createJob = useCreateJob();

  const [modality, setModality] = useState<Modality>("image");
  const [deviceRequirements, setDeviceRequirements] = useState(
    "Head-mounted, min 720p",
  );
  const [minItems, setMinItems] = useState("10");
  const [budget, setBudget] = useState("100");

  const items = Number(minItems);
  const quote = quoteBudget(modality, items);
  const budgetValue = parseUsdc(budget);

  const errors = {
    deviceRequirements: !deviceRequirements.trim()
      ? "Describe the device this data has to come from."
      : deviceRequirements.length > 500
        ? "Keep this under 500 characters."
        : undefined,
    minItems:
      !Number.isInteger(items) || items < 1 || items > 100_000
        ? "Between 1 and 100,000 items."
        : undefined,
    budget:
      budgetValue < quote
        ? "Below the provider's quote — it would be declined."
        : budgetValue > MAX_JOB_BUDGET
          ? "Over the provider's 5,000 USDC ceiling."
          : undefined,
  };

  const invalid = Object.values(errors).some(Boolean);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (invalid) return;

    const result = await createJob.mutateAsync({
      spec: { modality, deviceRequirements, minItems: items },
      budget: budgetValue,
      expiresInDays: EXPIRY_DAYS,
    });

    router.push(routes.buyer.request(result.jobId));
  }

  return (
    <Panel as="form" onSubmit={handleSubmit} p={{ base: 8, md: 12 }} borderRadius="0" bg="bg.panel" borderColor="border.DEFAULT" borderWidth="1px">
      <Stack gap={8}>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          <Field.Root>
            <Field.Label textStyle="body-md" fontWeight="600" color="primary">Modality</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={modality}
                bg="bg.panel"
                borderColor="border.DEFAULT"
                borderRadius="0"
                fontFamily="body"
                onChange={(event) =>
                  setModality(event.currentTarget.value as Modality)
                }
              >
                {MODALITIES.map((option) => (
                  <option key={option} value={option}>
                    {MODALITY_LABELS[option]}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>

          <Field.Root invalid={Boolean(errors.minItems)}>
            <Field.Label textStyle="body-md" fontWeight="600" color="primary">Minimum items</Field.Label>
            <Input
              type="number"
              value={minItems}
              bg="bg.panel"
              borderColor="border.DEFAULT"
              borderRadius="0"
              fontFamily="mono"
              onChange={(event) => setMinItems(event.currentTarget.value)}
            />
            <Field.ErrorText>{errors.minItems}</Field.ErrorText>
          </Field.Root>
        </SimpleGrid>

        <Field.Root invalid={Boolean(errors.deviceRequirements)}>
          <Field.Label textStyle="body-md" fontWeight="600" color="primary">Device requirements</Field.Label>
          <Textarea
            rows={4}
            value={deviceRequirements}
            bg="bg.panel"
            borderColor="border.DEFAULT"
            borderRadius="0"
            fontFamily="body"
            placeholder="Head-mounted camera, 1080p minimum, 30fps"
            onChange={(event) =>
              setDeviceRequirements(event.currentTarget.value)
            }
          />
          <Field.ErrorText>{errors.deviceRequirements}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={Boolean(errors.budget)}>
          <Field.Label textStyle="body-md" fontWeight="600" color="primary">Budget (USDC)</Field.Label>
          <Input
            type="number"
            step="0.01"
            value={budget}
            bg="bg.panel"
            borderColor="border.DEFAULT"
            borderRadius="0"
            fontFamily="mono"
            placeholder="0.00"
            onChange={(event) => setBudget(event.currentTarget.value)}
          />
          <Field.HelperText textStyle="body-sm" color="fg.subtle" mt={3}>
            Provider quotes {formatUsdc(quote)} USDC for {items || 0} {MODALITY_LABELS[modality].toLowerCase()} items.
          </Field.HelperText>
          <Field.ErrorText>{errors.budget}</Field.ErrorText>
        </Field.Root>

        <Box borderTopWidth="1px" borderColor="border.DEFAULT" />

        <Button
          type="submit"
          bg="primary"
          color="onPrimary"
          borderRadius="0"
          px={8}
          py={6}
          textStyle="body-md"
          fontWeight="500"
          alignSelf="flex-start"
          disabled={invalid}
          loading={createJob.isPending}
          loadingText="Confirm in your wallet"
          _hover={{ bg: "onSurfaceVariant" }}
        >
          Create request
        </Button>

        {createJob.isError && (
          <Text fontSize="sm" color="warn.fg">
            {createJob.error.message}
          </Text>
        )}
      </Stack>
    </Panel>
  );
}
