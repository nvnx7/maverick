import { Box, Flex, Progress, Text } from "@chakra-ui/react";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { percent } from "@/utils/format";

type Props = {
  budget: bigint;
  spent: bigint;
};

export function RequestSpendBar({ budget, spent }: Props) {
  const used = percent(spent, budget);

  return (
    <Box>
      <Flex justify="space-between" align="baseline" mb={3} gap={4}>
        <Text textStyle="body-sm" fontWeight="600" color="primary">
          Spend Progress
        </Text>
        <Text textStyle="label-mono" color="fg.subtle">
          <UsdcAmount value={spent} unit={false} color="primary" /> of{" "}
          <UsdcAmount value={budget} />
        </Text>
      </Flex>

      <Progress.Root value={used} colorPalette="brand" size="xs">
        <Progress.Track bg="bg.emphasized">
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>

      <Text fontSize="xs" color="fg.muted" mt={2} fontFamily="mono">
        {used.toFixed(1)}% released
      </Text>
    </Box>
  );
}
