"use client";

import { Heading, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { routes } from "@/config/routes";
import { useRequestId } from "@/hooks/useRequestId";

export function SubmissionsPageHeader() {
  const id = useRequestId();

  return (
    <>
      <Link
        asChild
        fontSize="sm"
        color="fg.muted"
        gap={2}
        mb={6}
        _hover={{ color: "fg", textDecoration: "none" }}
      >
        <NextLink href={routes.contributor.fulfill(id)}>
          <LuArrowLeft size={14} /> Back to request
        </NextLink>
      </Link>

      <Heading textStyle="headline-lg" color="primary" mb={2}>
        Your submissions
      </Heading>
      <Text textStyle="body-md" color="fg.subtle" mb={8}>
        Claims you&apos;ve submitted for request #{id}. Payout timing is the
        provider&apos;s discretion, not enforced by the protocol.
      </Text>
    </>
  );
}
