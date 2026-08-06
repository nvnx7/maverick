"use client";

import { Box, Text } from "@chakra-ui/react";
import { useGetJob } from "@/api/jobs";
import { Mono } from "@/components/common/Mono";
import { useRequestId } from "@/hooks/useRequestId";
import { declineCopy } from "@/utils/decline";

export function RequestDeclineNotice() {
  const id = useRequestId();
  const { data } = useGetJob(id);

  if (data?.providerDecision !== "declined") return null;

  return (
    <Box
      borderWidth="1px"
      borderColor="warn.muted"
      bg="warn.subtle"
      p={5}
      mb={6}
    >
      <Text fontWeight="500" color="warn.fg" mb={2}>
        The provider declined this request
      </Text>
      <Text fontSize="sm" color="fg.muted" mb={3}>
        {declineCopy(data.declineReason)}
      </Text>
      <Mono fontSize="xs" color="warn.fg">
        {data.declineReason}
      </Mono>
    </Box>
  );
}
