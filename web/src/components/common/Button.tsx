"use client";

import {
  Button as ChakraButton,
  type ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";
import { forwardRef } from "react";

export type ButtonVariant = "primary" | "outline" | "dark" | "ghost";

export type ButtonProps = Omit<ChakraButtonProps, "variant"> & {
  variant?: ButtonVariant;
  animated?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", animated = true, _hover, transition, ...props },
    ref,
  ) {
    let variantStyles = {
      bg: "primary",
      color: "onPrimary",
      border: "1px solid",
      borderColor: "primary",
      hoverBg: "onSurfaceVariant",
      hoverShadow: "4px 4px 0px 0px #000000",
    };

    if (variant === "outline") {
      variantStyles = {
        bg: "transparent",
        color: "primary",
        border: "1px solid",
        borderColor: "primary",
        hoverBg: "surfaceNeutral",
        hoverShadow: "4px 4px 0px 0px #000000",
      };
    } else if (variant === "dark") {
      variantStyles = {
        bg: "onPrimary",
        color: "primary",
        border: "1px solid",
        borderColor: "onPrimary",
        hoverBg: "#FFFFFF",
        hoverShadow: "4px 4px 0px 0px #60A5FA",
      };
    } else if (variant === "ghost") {
      variantStyles = {
        bg: "transparent",
        color: "primary",
        border: "1px solid",
        borderColor: "transparent",
        hoverBg: "surfaceNeutral",
        hoverShadow: "none",
      };
    }

    return (
      <ChakraButton
        ref={ref}
        borderRadius="0"
        fontWeight="600"
        bg={variantStyles.bg}
        color={variantStyles.color}
        border={variantStyles.border}
        borderColor={variantStyles.borderColor}
        transition={
          animated ? "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" : transition
        }
        _hover={
          animated
            ? {
                bg: variantStyles.hoverBg,
                transform:
                  variantStyles.hoverShadow !== "none"
                    ? "translate(-2px, -2px)"
                    : "none",
                boxShadow:
                  variantStyles.hoverShadow !== "none"
                    ? variantStyles.hoverShadow
                    : "none",
                ..._hover,
              }
            : { bg: variantStyles.hoverBg, ..._hover }
        }
        {...props}
      />
    );
  },
);
