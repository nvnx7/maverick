import { Text, VStack } from "@chakra-ui/react";

type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

/** States what happened and what to do next — no apology, no vagueness. */
export function EmptyState({ title, description, children }: Props) {
  return (
    <VStack
      gap={3}
      py={16}
      px={6}
      textAlign="center"
      border="1px solid"
      borderColor="primary"
      borderRadius="0"
      bg="surfaceNeutral"
    >
      <Text textStyle="body-lg" fontWeight="700" color="primary">
        {title}
      </Text>
      {description && (
        <Text color="fg.muted" fontSize="14px" maxW="md">
          {description}
        </Text>
      )}
      {children}
    </VStack>
  );
}

