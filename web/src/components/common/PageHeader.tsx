import { Box, Flex, Heading, HStack, Text } from "@chakra-ui/react";

type Props = {
  title: string;
  tag?: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, tag, description, children }: Props) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "start", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap={4}
      mb={8}
      pb={6}
      borderBottom="1px solid"
      borderColor="border.chrome"
    >
      <Box>
        {tag && (
          <HStack gap={2} mb={1}>
            <Text
              textStyle="label-mono"
              color="secondary"
              fontWeight="700"
              fontSize="11px"
            >
              {tag.startsWith("//") ? tag : `// ${tag.toUpperCase()}`}
            </Text>
          </HStack>
        )}
        <Heading
          textStyle="headline-lg"
          color="primary"
          fontSize={{ base: "26px", md: "32px" }}
          fontWeight="800"
          letterSpacing="-0.02em"
        >
          {title}
        </Heading>
        {description && (
          <Text
            textStyle="body-md"
            color="fg.muted"
            mt={2}
            maxW="2xl"
            fontSize="15px"
          >
            {description}
          </Text>
        )}
      </Box>
      {children}
    </Flex>
  );
}
