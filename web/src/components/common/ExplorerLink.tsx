import { Link } from "@chakra-ui/react";
import { LuExternalLink } from "react-icons/lu";
import { addressUrl, txUrl } from "@/utils/explorer";
import { truncateMiddle } from "@/utils/format";

type Props = {
  value: string;
  kind: "address" | "tx";
  lead?: number;
  tail?: number;
};

/** Addresses and hashes are clickable proof, not decoration. */
export function ExplorerLink({ value, kind, lead = 10, tail = 8 }: Props) {
  return (
    <Link
      href={kind === "address" ? addressUrl(value) : txUrl(value)}
      target="_blank"
      rel="noreferrer"
      fontFamily="mono"
      fontSize="sm"
      color="fg"
      gap={1.5}
      _hover={{ color: "chain.fg", textDecoration: "none" }}
    >
      {truncateMiddle(value, lead, tail)}
      <LuExternalLink size={13} />
    </Link>
  );
}
