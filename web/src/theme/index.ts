import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-montserrat), system-ui, sans-serif" },
        body: { value: "var(--font-inter), system-ui, sans-serif" },
        mono: { value: "var(--font-jetbrains-mono), ui-monospace, monospace" },
      },
      colors: {
        // Core Palette
        primary: { value: "#000000" },
        onPrimary: { value: "#FFFFFF" },
        background: { value: "#FDF8F8" },
        surfaceNeutral: { value: "#F9F9F9" },
        borderSubtle: { value: "#E5E5E5" },
        borderInput: { value: "#B0B0B0" },
        secondary: { value: "#0066FF" },
        successGreen: { value: "#10B981" },
        dataMono: { value: "#666666" },
        onSurface: { value: "#1C1B1B" },
        onSurfaceVariant: { value: "#444748" },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "0" },
        l2: { value: "0" },
        l3: { value: "0" },
      },
      colors: {
        bg: {
          DEFAULT: { value: "{colors.background}" },
          panel: { value: "#FFFFFF" },
          subtle: { value: "{colors.surfaceNeutral}" },
          muted: { value: "{colors.surfaceNeutral}" },
        },
        fg: {
          DEFAULT: { value: "{colors.onSurface}" },
          muted: { value: "{colors.onSurfaceVariant}" },
          subtle: { value: "{colors.dataMono}" },
        },
        border: {
          DEFAULT: { value: "{colors.borderSubtle}" },
          muted: { value: "{colors.borderSubtle}" },
          chrome: { value: "#F0F0F0" },
          input: { value: "{colors.borderInput}" },
        },
        brand: {
          solid: { value: "{colors.primary}" },
          contrast: { value: "{colors.onPrimary}" },
          fg: { value: "{colors.primary}" },
          muted: { value: "{colors.borderSubtle}" },
        },
      },
    },
    textStyles: {
      "display-lg": {
        value: {
          fontFamily: "heading",
          fontSize: "48px",
          fontWeight: "700",
          lineHeight: "56px",
          letterSpacing: "-0.02em",
        },
      },
      "headline-lg": {
        value: {
          fontFamily: "heading",
          fontSize: "32px",
          fontWeight: "600",
          lineHeight: "40px",
          letterSpacing: "-0.01em",
        },
      },
      "headline-lg-mobile": {
        value: {
          fontFamily: "heading",
          fontSize: "28px",
          fontWeight: "600",
          lineHeight: "36px",
        },
      },
      "headline-md": {
        value: {
          fontFamily: "heading",
          fontSize: "24px",
          fontWeight: "600",
          lineHeight: "32px",
        },
      },
      "body-lg": {
        value: {
          fontFamily: "body",
          fontSize: "18px",
          fontWeight: "400",
          lineHeight: "28px",
        },
      },
      "body-md": {
        value: {
          fontFamily: "body",
          fontSize: "16px",
          fontWeight: "400",
          lineHeight: "24px",
        },
      },
      "body-sm": {
        value: {
          fontFamily: "body",
          fontSize: "14px",
          fontWeight: "400",
          lineHeight: "20px",
        },
      },
      "label-mono": {
        value: {
          fontFamily: "mono",
          fontSize: "12px",
          fontWeight: "500",
          lineHeight: "16px",
          letterSpacing: "0.05em",
        },
      },
    },
  },
  globalCss: {
    "html, body": {
      bg: "bg",
      color: "fg",
      fontFamily: "body",
    },
    "::selection": {
      bg: "secondary",
      color: "white",
    },
  },
});

export const system = createSystem(defaultConfig, config);
