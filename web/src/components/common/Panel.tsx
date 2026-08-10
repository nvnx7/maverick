import { Box, type BoxProps } from "@chakra-ui/react";

export type PanelProps = BoxProps & {
  interactive?: boolean;
};

export function Panel({
  interactive,
  _hover,
  transition,
  ...props
}: PanelProps) {
  return (
    <Box
      bg="bg.panel"
      border="1px solid"
      borderColor="primary"
      borderRadius="0"
      p={6}
      transition={
        interactive ? "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" : transition
      }
      _hover={
        interactive
          ? {
              transform: "translate(-3px, -3px)",
              boxShadow: "5px 5px 0px 0px #000000",
              ..._hover,
            }
          : _hover
      }
      {...props}
    />
  );
}
