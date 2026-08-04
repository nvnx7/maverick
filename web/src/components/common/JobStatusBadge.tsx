import { Badge, type BadgeProps } from "@chakra-ui/react";
import type { JobStatus } from "@/types";
import { JOB_STATUS_TONE, jobStatusName } from "@/utils/job";

type Props = BadgeProps & { status: JobStatus };

/** Shows the contract's literal JobStatus enum value, never a softer label. */
export function JobStatusBadge({ status, ...rest }: Props) {
  return (
    <Badge
      colorPalette={JOB_STATUS_TONE[status]}
      variant="surface"
      fontFamily="mono"
      fontSize="xs"
      fontWeight="500"
      px={2}
      py={1}
      {...rest}
    >
      {jobStatusName(status)}
    </Badge>
  );
}
