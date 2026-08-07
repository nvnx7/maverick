import {
  Box,
  Heading,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { routes } from "@/config/routes";

const paths = [
  {
    href: routes.buyer.newRequest,
    title: "Request data",
    body: "Post a spec, fund it in USDC, and watch submissions land against it. The escrow holds your budget — we never do.",
    cta: "Post a request",
  },
  {
    href: routes.contributor.browse,
    title: "Fulfill requests",
    body: "Capture on a device that signs what it records. Submit, get verified, get paid straight to your wallet.",
    cta: "Browse funded requests",
  },
];

export function PathCards() {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
      {paths.map((path) => (
        <LinkBox
          key={path.href}
          as="article"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          p={{ base: 6, md: 8 }}
          transition="border-color 0.15s, background 0.15s"
          _hover={{ borderColor: "brand.600", bg: "bg.subtle" }}
        >
          <Heading size="lg" fontWeight="500" letterSpacing="-0.01em">
            <LinkOverlay asChild>
              <NextLink href={path.href}>{path.title}</NextLink>
            </LinkOverlay>
          </Heading>

          <Text color="fg.muted" mt={3} lineHeight="1.6">
            {path.body}
          </Text>

          <Box
            mt={6}
            display="inline-flex"
            alignItems="center"
            gap={2}
            fontSize="sm"
            color="brand.fg"
          >
            {path.cta}
            <LuArrowRight size={15} />
          </Box>
        </LinkBox>
      ))}
    </SimpleGrid>
  );
}
