"use client";

import { Badge, Box, Heading, HStack, Icon, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowRight, LuCheck } from "react-icons/lu";
import { Button } from "@/components/common/Button";
import { routes } from "@/config/routes";

export function AudienceCards() {
  return (
    <Box py={{ base: 16, md: 24 }} bg="bg" borderBottomWidth="1px" borderColor="border.DEFAULT">
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
        {/* Buyers Card */}
        <Box 
          p={{ base: 8, md: 12 }} 
          bg="surfaceNeutral"
          border="1px solid" 
          borderColor="primary"
          position="relative"
          overflow="hidden"
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={{
            bg: "bg.panel",
            transform: "translate(-4px, -4px)",
            borderColor: "secondary",
            boxShadow: "8px 8px 0px 0px #0066FF",
          }}
        >
          {/* Subtle Grid Pattern Overlay */}
          <Box 
            position="absolute" 
            inset={0} 
            opacity={0.25} 
            backgroundImage="linear-gradient(to right, #E5E5E5 1px, transparent 1px), linear-gradient(to bottom, #E5E5E5 1px, transparent 1px)" 
            backgroundSize="30px 30px" 
            zIndex={0}
            pointerEvents="none"
          />
          <Box position="relative" zIndex={1}>
            <Badge 
              bg="#E6F0FF" 
              color="secondary" 
              textStyle="label-mono" 
              px={3} 
              py={1} 
              mb={6} 
              borderWidth="1px" 
              borderColor="transparent"
              fontSize="11px"
              fontWeight="700"
            >
              FOR AI BUILDERS & ENTERPRISE
            </Badge>
            
            <Heading as="h3" textStyle="headline-lg" color="primary" mb={4} fontSize={{ base: "26px", md: "32px" }}>
              Source Verified AI Data at Scale
            </Heading>

            <Text textStyle="body-lg" color="fg.muted" mb={8} fontSize="16px">
              Tap into a global network of contributors ready to capture, label, and verify high-quality datasets under programmable smart escrow.
            </Text>

            {/* Capability Checklist */}
            <VStack align="flex-start" gap={3} mb={10} borderTop="1px solid" borderColor="border.chrome" pt={6}>
              <HStack gap={2.5}>
                <Icon as={LuCheck} color="secondary" boxSize={4} />
                <Text textStyle="body-md" color="primary" fontSize="14px" fontWeight="600">
                  Hardware-attested cryptographic device provenance
                </Text>
              </HStack>
              <HStack gap={2.5}>
                <Icon as={LuCheck} color="secondary" boxSize={4} />
                <Text textStyle="body-md" color="primary" fontSize="14px" fontWeight="600">
                  Custom AI Evaluator Agent verification rules
                </Text>
              </HStack>
              <HStack gap={2.5}>
                <Icon as={LuCheck} color="secondary" boxSize={4} />
                <Text textStyle="body-md" color="primary" fontSize="14px" fontWeight="600">
                  Guaranteed ERC-8183 escrow refund if quota unfulfilled
                </Text>
              </HStack>
            </VStack>

            <Button
              asChild
              variant="primary"
              px={6}
              py={6}
              fontSize="sm"
            >
              <NextLink href={routes.buyer.newRequest}>
                Post Data Job <Icon as={LuArrowRight} ml={2} />
              </NextLink>
            </Button>
          </Box>
        </Box>

        {/* Contributors Card */}
        <Box 
          p={{ base: 8, md: 12 }} 
          bg="surfaceNeutral"
          border="1px solid" 
          borderColor="primary"
          position="relative"
          overflow="hidden"
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={{
            bg: "bg.panel",
            transform: "translate(-4px, -4px)",
            borderColor: "successGreen",
            boxShadow: "8px 8px 0px 0px #10B981",
          }}
        >
          {/* Subtle Grid Pattern Overlay */}
          <Box 
            position="absolute" 
            inset={0} 
            opacity={0.25} 
            backgroundImage="linear-gradient(to right, #E5E5E5 1px, transparent 1px), linear-gradient(to bottom, #E5E5E5 1px, transparent 1px)" 
            backgroundSize="30px 30px" 
            zIndex={0}
            pointerEvents="none"
          />

          <Box position="relative" zIndex={1}>
            <Badge 
              bg="#E7F8F2" 
              color="successGreen" 
              textStyle="label-mono" 
              px={3} 
              py={1} 
              mb={6} 
              borderWidth="1px" 
              borderColor="transparent"
              fontSize="11px"
              fontWeight="700"
            >
              FOR DATA COLLECTORS & OPERATORS
            </Badge>
            
            <Heading as="h3" textStyle="headline-lg" color="primary" mb={4} fontSize={{ base: "26px", md: "32px" }}>
              Turn Your Captures into Opportunity
            </Heading>

            <Text textStyle="body-lg" color="fg.muted" mb={8} fontSize="16px">
              Contribute to open AI development and receive instant, transparent USDC payouts directly to your wallet upon verification.
            </Text>

            {/* Capability Checklist */}
            <VStack align="flex-start" gap={3} mb={10} borderTop="1px solid" borderColor="border.chrome" pt={6}>
              <HStack gap={2.5}>
                <Icon as={LuCheck} color="successGreen" boxSize={4} />
                <Text textStyle="body-md" color="primary" fontSize="14px" fontWeight="600">
                  Instant Arc USDC disbursal (&lt; 500ms finality)
                </Text>
              </HStack>
              <HStack gap={2.5}>
                <Icon as={LuCheck} color="successGreen" boxSize={4} />
                <Text textStyle="body-md" color="primary" fontSize="14px" fontWeight="600">
                  Native EIP-712 device signature verification
                </Text>
              </HStack>
              <HStack gap={2.5}>
                <Icon as={LuCheck} color="successGreen" boxSize={4} />
                <Text textStyle="body-md" color="primary" fontSize="14px" fontWeight="600">
                  Zero platform middleman deduction on verified claims
                </Text>
              </HStack>
            </VStack>

            <Button
              asChild
              variant="outline"
              px={6}
              py={6}
              fontSize="sm"
            >
              <NextLink href={routes.contributor.browse}>
                Explore Open Jobs <Icon as={LuArrowRight} ml={2} />
              </NextLink>
            </Button>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

