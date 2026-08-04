"use client";

import { Flex, Text } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useGetMySubmissions } from "@/api/getMySubmissions";
import { Panel } from "@/components/common/Panel";
import { UsdcAmount } from "@/components/common/UsdcAmount";

export function SubmissionsEarnings() {
  const { address } = useAccount();
  const { data } = useGetMySubmissions(address);

  const total = (data ?? []).reduce(
    (sum, submission) =>
      submission.status === "paid" ? sum + submission.amount : sum,
    0n,
  );

  const awaiting = (data ?? []).reduce(
    (sum, submission) =>
      submission.status === "paid" ? sum : sum + submission.amount,
    0n,
  );

  return (
    <Panel mb={8}>
      <Flex
        justify="space-between"
        align={{ base: "start", sm: "flex-end" }}
        direction={{ base: "column", sm: "row" }}
        gap={4}
      >
        <div>
          <Text fontSize="sm" color="fg.muted" mb={2}>
            Earned
          </Text>
          <UsdcAmount
            value={total}
            fontSize={{ base: "4xl", md: "5xl" }}
            color="brand.fg"
            lineHeight="1"
          />
        </div>

        <div>
          <Text fontSize="sm" color="fg.muted" mb={2} textAlign="end">
            Awaiting payout
          </Text>
          <UsdcAmount value={awaiting} fontSize="xl" textAlign="end" />
        </div>
      </Flex>
    </Panel>
  );
}
