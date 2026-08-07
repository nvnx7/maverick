"use client";

import {
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
import { UsdcAmount } from "@/components/common/UsdcAmount";
import {
  MAX_JOB_BUDGET,
  MODALITIES,
  MODALITY_LABELS,
  type Modality,
} from "@/config/constants";
import { routes } from "@/config/routes";
import { parseUsdc } from "@/utils/format";
import { quoteBudget } from "@/utils/quote";
import { StepLabel } from "./StepLabel";

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
    <Panel as="form" onSubmit={handleSubmit}>
      <StepLabel step={1} label="Create your request on-chain" />

      <Stack gap={6}>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          <Field.Root>
            <Field.Label>Modality</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={modality}
                bg="bg.subtle"
                borderColor="border"
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
            <Field.Label>Minimum items</Field.Label>
            <Input
              type="number"
              value={minItems}
              bg="bg.subtle"
              borderColor="border"
              fontFamily="mono"
              onChange={(event) => setMinItems(event.currentTarget.value)}
            />
            <Field.ErrorText>{errors.minItems}</Field.ErrorText>
          </Field.Root>
        </SimpleGrid>

        <Field.Root invalid={Boolean(errors.deviceRequirements)}>
          <Field.Label>Device requirements</Field.Label>
          <Textarea
            rows={3}
            value={deviceRequirements}
            bg="bg.subtle"
            borderColor="border"
            placeholder="Head-mounted camera, 1080p minimum, 30fps"
            onChange={(event) =>
              setDeviceRequirements(event.currentTarget.value)
            }
          />
          <Field.ErrorText>{errors.deviceRequirements}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={Boolean(errors.budget)}>
          <Field.Label>Budget (USDC)</Field.Label>
          <Input
            type="number"
            step="0.01"
            value={budget}
            bg="bg.subtle"
            borderColor="border"
            fontFamily="mono"
            placeholder="0.00"
            onChange={(event) => setBudget(event.currentTarget.value)}
          />
          <Field.HelperText>
            Provider quotes <UsdcAmount value={quote} /> for {items || 0}{" "}
            {MODALITY_LABELS[modality].toLowerCase()} items.
          </Field.HelperText>
          <Field.ErrorText>{errors.budget}</Field.ErrorText>
        </Field.Root>

        <Text fontSize="sm" color="fg.muted">
          Creating the request costs one transaction. Funding it is a second,
          separate transaction you approve only after the provider agrees.
        </Text>

        <Button
          type="submit"
          colorPalette="brand"
          alignSelf="flex-start"
          disabled={invalid}
          loading={createJob.isPending}
          loadingText="Confirm in your wallet"
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
