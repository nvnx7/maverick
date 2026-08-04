import { Center, Spinner, Text, VStack } from "@chakra-ui/react";

export function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <Center py={16} borderWidth="1px" borderColor="border" bg="bg.panel">
      <VStack gap={3}>
        <Spinner size="sm" color="fg.muted" />
        <Text fontSize="sm" color="fg.muted">
          {label}
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
      borderWidth="1px"
      borderColor="warn.muted"
      bg="bg.panel"
    >
      <Text fontWeight="500" color="warn.fg">
        Couldn&apos;t load this
      </Text>
      <Text fontSize="sm" color="fg.muted" maxW="md">
        {message ?? "The request failed. Refresh to try again."}
      </Text>
    </VStack>
  );
}
