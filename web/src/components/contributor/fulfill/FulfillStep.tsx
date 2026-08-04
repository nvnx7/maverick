import { Box, Flex, Text } from "@chakra-ui/react";

type Props = {
  index: number;
  title: string;
  description: string;
  done?: boolean;
  children?: React.ReactNode;
};

export function FulfillStep({
  index,
  title,
  description,
  done,
  children,
}: Props) {
  return (
    <Flex
      gap={4}
      py={5}
      borderBottomWidth="1px"
      borderColor="border.muted"
      _last={{ borderBottomWidth: 0, pb: 0 }}
    >
      <Box
        boxSize="24px"
        flexShrink={0}
        borderWidth="1px"
        borderColor={done ? "brand.500" : "border"}
        bg={done ? "brand.500" : "transparent"}
        color={done ? "brand.contrast" : "fg.muted"}
        fontFamily="mono"
        fontSize="xs"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {index}
      </Box>

      <Box flex="1" minW={0}>
        <Text fontWeight="500" mb={1}>
          {title}
        </Text>
        <Text fontSize="sm" color="fg.muted" mb={children ? 4 : 0}>
          {description}
        </Text>
        {children}
      </Box>
    </Flex>
  );
}
