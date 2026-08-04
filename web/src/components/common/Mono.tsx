import { Text, type TextProps } from "@chakra-ui/react";

/** Facts the chain produced render in mono; everything a human wrote stays sans. */
export function Mono(props: TextProps) {
  return (
    <Text
      as="span"
      fontFamily="mono"
      fontSize="sm"
      letterSpacing="-0.01em"
      {...props}
    />
  );
}
