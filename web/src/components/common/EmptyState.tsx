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
      borderWidth="1px"
      borderColor="border"
      borderStyle="dashed"
      bg="bg.panel"
    >
      <Text fontWeight="500">{title}</Text>
      {description && (
        <Text color="fg.muted" fontSize="sm" maxW="md">
          {description}
        </Text>
      )}
      {children}
    </VStack>
  );
}
