"use client";

import { Box, Flex, Heading, Text, SimpleGrid, Link, Icon, Badge } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { routes } from "@/config/routes";

export function AudienceCards() {
  return (
    <Box py={{ base: 16, md: 24 }} borderBottomWidth="1px" borderColor="border.DEFAULT">
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
        {/* Buyers Card */}
        <Box 
          p={{ base: 8, md: 12 }} 
          bg="surfaceNeutral" 
          borderWidth="1px" 
          borderColor="border.DEFAULT"
        >
          <Badge 
            bg="#E6F0FF" 
            color="secondary" 
            textStyle="label-mono" 
            px={2} 
            py={1} 
            mb={8} 
            borderWidth="1px" 
            borderColor="transparent"
          >
            FOR BUYERS
          </Badge>
          
          <Heading as="h3" textStyle="headline-lg" color="primary" mb={4} maxW="300px">
            Get the data your AI needs.
          </Heading>
          <Text textStyle="body-lg" color="fg.muted" mb={12} maxW="380px">
            Tap into a global network of contributors ready to source, label, and verify high-quality datasets.
          </Text>

          <Link asChild textStyle="body-sm" fontWeight="500" color="primary" _hover={{ color: "secondary" }}>
            <NextLink href={routes.buyer.newRequest}>
              Post a Data Job <Icon as={LuArrowRight} ml={1} />
            </NextLink>
          </Link>
        </Box>

        {/* Contributors Card */}
        <Box 
          p={{ base: 8, md: 12 }} 
          bg="bg.subtle" 
          borderWidth="1px" 
          borderColor="border.DEFAULT"
          position="relative"
          overflow="hidden"
        >
          {/* Subtle Grid Pattern Overlay */}
          <Box 
            position="absolute" 
            inset={0} 
            opacity={0.4} 
            backgroundImage="linear-gradient(to right, #E5E5E5 1px, transparent 1px), linear-gradient(to bottom, #E5E5E5 1px, transparent 1px)" 
            backgroundSize="40px 40px" 
            zIndex={0}
            pointerEvents="none"
          />

          <Box position="relative" zIndex={1}>
            <Badge 
              bg="#E7F8F2" 
              color="successGreen" 
              textStyle="label-mono" 
              px={2} 
              py={1} 
              mb={8} 
              borderWidth="1px" 
              borderColor="transparent"
            >
              FOR CONTRIBUTORS
            </Badge>
            
            <Heading as="h3" textStyle="headline-lg" color="primary" mb={4} maxW="340px">
              Turn your data into opportunity.
            </Heading>
            <Text textStyle="body-lg" color="fg.muted" mb={12} maxW="380px">
              Contribute to open AI development and earn transparent USDC payouts for verified work.
            </Text>

            <Link asChild textStyle="body-sm" fontWeight="500" color="primary" _hover={{ color: "successGreen" }}>
              <NextLink href={routes.contributor.browse}>
                Explore Jobs <Icon as={LuArrowRight} ml={1} />
              </NextLink>
            </Link>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
