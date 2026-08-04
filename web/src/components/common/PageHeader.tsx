import { Box, Flex, Heading, Text } from "@chakra-ui/react";

type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, description, children }: Props) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "start", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap={4}
      mb={8}
    >
      <Box>
        <Heading size="xl" fontWeight="500" letterSpacing="-0.02em">
          {title}
        </Heading>
        {description && (
          <Text color="fg.muted" mt={2} maxW="2xl">
            {description}
          </Text>
        )}
      </Box>
      {children}
    </Flex>
  );
}
