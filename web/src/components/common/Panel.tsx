import { Box, type BoxProps } from "@chakra-ui/react";

export function Panel(props: BoxProps) {
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.DEFAULT"
      borderRadius="0"
      p={6}
      {...props}
    />
  );
}
