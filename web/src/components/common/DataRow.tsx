import { Box, Flex, Text } from "@chakra-ui/react";

type Props = {
  label: string;
  children: React.ReactNode;
};

export function DataRow({ label, children }: Props) {
  return (
    <Flex
      justify="space-between"
      align="center"
      gap={6}
      py={3}
      borderBottomWidth="1px"
      borderColor="border.muted"
      _last={{ borderBottomWidth: 0, pb: 0 }}
    >
      <Text fontSize="sm" color="fg.muted">
        {label}
      </Text>
      <Box textAlign="right">{children}</Box>
    </Flex>
  );
}
