"use client";

import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowRight, LuCheck, LuVideo, LuMic, LuBox } from "react-icons/lu";
import { Button } from "@/components/common/Button";
import { routes } from "@/config/routes";

const categories = [
  {
    title: "Computer Vision & Video",
    tagline: "First-person dashcam, egocentric action, and object tracking datasets.",
    icon: LuVideo,
    badge: "VISION PIPELINE",
    badgeColor: "secondary",
    specs: [
      "Hardware-enclave video timestamping",
      "Automated frame-by-frame Evaluator AI",
      "Multi-resolution (1080p / 4K) stream support",
    ],
  },
  {
    title: "Multilingual Voice & Audio",
    tagline: "Accented speech, acoustic noise environments, and dialogue transcripts.",
    icon: LuMic,
    badge: "AUDIO PIPELINE",
    badgeColor: "successGreen",
    specs: [
      "Cryptographic microphone stream attestation",
      "Whisper QA & acoustic noise verifiers",
      "Raw WAV & lossless FLAC format support",
    ],
  },
  {
    title: "3D Spatial & LiDAR Scans",
    tagline: "Street-level point clouds, spatial mapping, and depth sensor captures.",
    icon: LuBox,
    badge: "SPATIAL PIPELINE",
    badgeColor: "primary",
    specs: [
      "Hardware sensor depth verification",
      "PointNet spatial density validation",
      "Geospatial EIP-712 location signing",
    ],
  },
];

export function MarketplacePreview() {
  return (
    <Box py={{ base: 16, md: 24 }} bg="bg" borderBottomWidth="1px" borderColor="border.DEFAULT">
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "flex-end" }} mb={12} gap={4}>
        <Box maxW="600px">
          <HStack gap={2} mb={2}>
            <Text textStyle="label-mono" color="secondary" fontWeight="700">
              // DATASET SHOWCASE
            </Text>
          </HStack>
          <Heading as="h2" textStyle="headline-lg" color="primary" fontSize={{ base: "28px", md: "36px" }}>
            Supported AI Data Modalities
          </Heading>
          <Text textStyle="body-md" color="fg.muted" mt={2} fontSize="16px">
            Maverick powers programmable escrow and hardware provenance across diverse AI data formats.
          </Text>
        </Box>
        <Button
          asChild
          variant="outline"
          px={6}
          py={5}
          fontSize="sm"
        >
          <NextLink href={routes.contributor.browse}>
            Explore Active Marketplace Jobs <Icon as={LuArrowRight} ml={1} />
          </NextLink>
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
        {categories.map((cat) => (
          <Flex
            key={cat.title}
            direction="column"
            justify="space-between"
            bg="surfaceNeutral"
            border="1px solid"
            borderColor="primary"
            p={8}
            position="relative"
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              bg: "bg.panel",
              transform: "translate(-4px, -4px)",
              borderColor: "primary",
              boxShadow: "6px 6px 0px 0px #000000",
            }}
          >
            <Box>
              {/* Header Badge */}
              <Flex justify="space-between" align="center" mb={6}>
                <Box p={3} bg="primary" color="onPrimary">
                  <Icon as={cat.icon} boxSize={5} />
                </Box>
                <Badge
                  variant="outline"
                  borderColor="border.input"
                  color={cat.badgeColor}
                  borderRadius="0"
                  px={2.5}
                  py={1}
                  textStyle="label-mono"
                  fontSize="10px"
                  fontWeight="700"
                >
                  {cat.badge}
                </Badge>
              </Flex>

              <Heading as="h3" textStyle="body-lg" fontWeight="700" color="primary" mb={3} fontSize="20px">
                {cat.title}
              </Heading>

              <Text textStyle="body-md" color="fg.muted" mb={6} fontSize="14px" lineHeight="1.5">
                {cat.tagline}
              </Text>

              {/* Specs Checklist */}
              <VStack align="flex-start" gap={2.5} borderTop="1px solid" borderColor="border.chrome" pt={5} mb={2}>
                {cat.specs.map((spec) => (
                  <HStack key={spec} gap={2}>
                    <Icon as={LuCheck} color="successGreen" boxSize={4} />
                    <Text textStyle="body-sm" color="primary" fontSize="13px" fontWeight="600">
                      {spec}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Bottom Category Status Pill */}
            <Box pt={6}>
              <HStack justify="space-between" textStyle="label-mono" fontSize="11px" color="fg.subtle">
                <Text color="primary" fontWeight="700">ESCROW SUPPORTED</Text>
                <Text color="secondary" fontWeight="700">READY ON ARC</Text>
              </HStack>
            </Box>
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  );
}

