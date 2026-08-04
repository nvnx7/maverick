"use client";

import { Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  label: string;
};

export function NavLink({ href, label }: Props) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      asChild
      fontSize="sm"
      color={active ? "fg" : "fg.muted"}
      fontWeight={active ? "500" : "400"}
      _hover={{ color: "fg", textDecoration: "none" }}
    >
      <NextLink href={href}>{label}</NextLink>
    </Link>
  );
}
