"use client";

import { HStack, IconButton, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";
import { copyText } from "@/utils/clipboard";
import { truncateMiddle } from "@/utils/format";

type Props = {
  value: string;
  lead?: number;
  tail?: number;
};

export function CopyableHash({ value, lead = 10, tail = 8 }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!(await copyText(value))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <HStack gap={1.5}>
      <Text as="span" fontFamily="mono" fontSize="sm" color="chain.fg">
        {truncateMiddle(value, lead, tail)}
      </Text>
      <IconButton
        aria-label={copied ? "Copied" : "Copy hash"}
        size="2xs"
        variant="ghost"
        color="fg.muted"
        onClick={handleCopy}
        _hover={{ color: "fg", bg: "bg.emphasized" }}
      >
        {copied ? <LuCheck /> : <LuCopy />}
      </IconButton>
    </HStack>
  );
}
