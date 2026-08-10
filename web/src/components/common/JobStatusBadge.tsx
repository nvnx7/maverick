import { Badge, type BadgeProps } from "@chakra-ui/react";
import type { JobStatus } from "@/types";
import { JOB_STATUS_TONE, jobStatusName } from "@/utils/job";

type Props = BadgeProps & { status: JobStatus };

/** Shows the contract's literal JobStatus enum value, never a softer label. */
export function JobStatusBadge({ status, ...rest }: Props) {
  return (
    <Badge
      colorPalette={JOB_STATUS_TONE[status]}
      variant="subtle"
      borderRadius="0"
      border="1px solid"
      borderColor="currentColor"
      textStyle="label-mono"
      fontSize="10px"
      fontWeight="700"
      px={2.5}
      py={1}
      {...rest}
    >
      {jobStatusName(status)}
    </Badge>
  );
}
