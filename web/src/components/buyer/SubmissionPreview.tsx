"use client";

import { Box, Flex, Image, SimpleGrid, Spinner, Text } from "@chakra-ui/react";
import type { Hash } from "viem";
import { useGetClaimFiles } from "@/api/submissions/getClaimFiles";

type Props = {
  jobId: string;
  /** Deliverables of claims actually submitted on-chain for this job. */
  dataHashes: Hash[];
};

export function SubmissionPreview({ jobId, dataHashes }: Props) {
  const { data: files, isPending } = useGetClaimFiles({ jobId, dataHashes });

  // Nothing claimed means nothing to preview — don't spin, and don't fall back to
  // listing the job's storage prefix, which would surface unclaimed uploads.
  if (dataHashes.length === 0) return null;

  if (isPending) {
    return (
      <Flex align="center" gap={3} py={4}>
        <Spinner size="sm" color="fg.muted" />
        <Text fontSize="sm" color="fg.muted">
          Loading previews...
        </Text>
      </Flex>
    );
  }

  if (!files || files.length === 0) return null;

  const previewFiles = files.slice(0, 5);

  return (
    <Box mb={6}>
      <SimpleGrid columns={{ base: 2, md: 5 }} gap={4}>
        {previewFiles.map((file) => (
          <Box
            key={file.url}
            borderWidth="1px"
            borderColor="border.DEFAULT"
            borderRadius="0"
            overflow="hidden"
            aspectRatio={1}
            position="relative"
            bg="surfaceNeutral"
          >
            {file.mimeType.startsWith("image/") ? (
              <Image
                src={file.url}
                alt={file.name}
                objectFit="cover"
                w="100%"
                h="100%"
              />
            ) : (
              <Flex
                w="100%"
                h="100%"
                align="center"
                justify="center"
                p={4}
                textAlign="center"
              >
                <Text textStyle="label-mono" color="fg.subtle" truncate>
                  {file.name}
                </Text>
              </Flex>
            )}
          </Box>
        ))}
      </SimpleGrid>
      {files.length > 5 && (
        <Text textStyle="label-mono" color="fg.subtle" mt={2} textAlign="right">
          + {files.length - 5} more files
        </Text>
      )}
    </Box>
  );
}
