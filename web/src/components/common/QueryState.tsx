import { Center, Spinner, Text, VStack } from "@chakra-ui/react";

export function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <Center py={16} border="1px solid" borderColor="primary" bg="surfaceNeutral" borderRadius="0">
      <VStack gap={3}>
        <Spinner size="sm" color="primary" />
        <Text textStyle="label-mono" fontSize="12px" color="fg.subtle" fontWeight="600">
          {label.toUpperCase()}
        </Text>
      </VStack>
    </Center>
  );
}

export function ErrorBlock({ message }: { message?: string }) {
  return (
    <VStack
      gap={2}
      py={16}
      px={6}
      textAlign="center"
      border="1px solid"
      borderColor="primary"
      borderRadius="0"
      bg="surfaceNeutral"
    >
      <Text textStyle="body-lg" fontWeight="700" color="red.600">
        Request Execution Failed
      </Text>
      <Text fontSize="14px" color="fg.muted" maxW="md">
        {message ?? "The request failed. Refresh to try again."}
      </Text>
    </VStack>
  );
}

