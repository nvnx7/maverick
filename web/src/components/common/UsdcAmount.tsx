import { Text, type TextProps } from "@chakra-ui/react";
import { formatUsdc } from "@/utils/format";

type Props = Omit<TextProps, "children"> & { value: bigint; unit?: boolean };

export function UsdcAmount({ value, unit = true, ...rest }: Props) {
  return (
    <Text as="span" fontFamily="mono" letterSpacing="-0.01em" {...rest}>
      {formatUsdc(value)}
      {unit && (
        <Text as="span" color="fg.muted" ms={1.5} fontSize="0.85em">
          USDC
        </Text>
      )}
    </Text>
  );
}
