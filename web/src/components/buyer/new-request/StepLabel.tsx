import { Text } from "@chakra-ui/react";

type Props = {
  step: 1 | 2;
  label: string;
};

/** The two transactions are named out loud rather than hidden behind a spinner. */
export function StepLabel({ step, label }: Props) {
  return (
    <Text
      fontFamily="mono"
      fontSize="xs"
      color="brand.fg"
      textTransform="uppercase"
      letterSpacing="0.08em"
      mb={3}
    >
      Step {step} of 2 · {label}
    </Text>
  );
}
