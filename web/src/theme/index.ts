import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// Dark-only palette. Values are flat rather than light/dark pairs — the app ships
// one theme and the chain-fact colors are load-bearing, not decorative.
const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-plex-sans), system-ui, sans-serif" },
        body: { value: "var(--font-plex-sans), system-ui, sans-serif" },
        mono: { value: "var(--font-plex-mono), ui-monospace, monospace" },
      },
      colors: {
        // Institutional green — CTAs, funded/verified states, positive numbers.
        brand: {
          50: { value: "#EAF7F0" },
          100: { value: "#CDEBDD" },
          200: { value: "#A3DCC3" },
          300: { value: "#77CBA6" },
          400: { value: "#55BC8D" },
          500: { value: "#3EAE76" },
          600: { value: "#329063" },
          700: { value: "#29734F" },
          800: { value: "#1F573C" },
          900: { value: "#16412D" },
          950: { value: "#0D2A1D" },
        },
        // Cyan is reserved for cryptographic UI: signatures, hashes, verification.
        chain: {
          50: { value: "#EAF7FB" },
          100: { value: "#CCEBF4" },
          200: { value: "#A2DCEB" },
          300: { value: "#74CBE0" },
          400: { value: "#53BEDA" },
          500: { value: "#3FB6D3" },
          600: { value: "#3496AF" },
          700: { value: "#2A788C" },
          800: { value: "#205B6A" },
          900: { value: "#184450" },
          950: { value: "#0F2B33" },
        },
        warn: {
          50: { value: "#FDF7EA" },
          100: { value: "#F9EBC9" },
          200: { value: "#F3DA9E" },
          300: { value: "#EBC66E" },
          400: { value: "#E3B754" },
          500: { value: "#D9A441" },
          600: { value: "#B78836" },
          700: { value: "#926C2B" },
          800: { value: "#6F5221" },
          900: { value: "#533E19" },
          950: { value: "#35270F" },
        },
      },
    },
    semanticTokens: {
      // Sharp corners throughout: every component reads these three.
      radii: {
        l1: { value: "0" },
        l2: { value: "0" },
        l3: { value: "0" },
      },
      colors: {
        bg: {
          DEFAULT: { value: "#0A0B0D" },
          panel: { value: "#121417" },
          subtle: { value: "#16181C" },
          muted: { value: "#16181C" },
          emphasized: { value: "#1C1F24" },
        },
        fg: {
          DEFAULT: { value: "#E8E9EA" },
          muted: { value: "#8A8F98" },
          subtle: { value: "#6B7079" },
        },
        border: {
          DEFAULT: { value: "#2A2D31" },
          muted: { value: "#212428" },
          emphasized: { value: "#3A3E44" },
        },
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "#06120C" },
          fg: { value: "{colors.brand.300}" },
          muted: { value: "{colors.brand.900}" },
          subtle: { value: "{colors.brand.950}" },
          emphasized: { value: "{colors.brand.600}" },
          focusRing: { value: "{colors.brand.500}" },
        },
        chain: {
          solid: { value: "{colors.chain.500}" },
          contrast: { value: "#04151B" },
          fg: { value: "{colors.chain.300}" },
          muted: { value: "{colors.chain.900}" },
          subtle: { value: "{colors.chain.950}" },
          emphasized: { value: "{colors.chain.600}" },
          focusRing: { value: "{colors.chain.500}" },
        },
        warn: {
          solid: { value: "{colors.warn.500}" },
          contrast: { value: "#1A1204" },
          fg: { value: "{colors.warn.300}" },
          muted: { value: "{colors.warn.900}" },
          subtle: { value: "{colors.warn.950}" },
          emphasized: { value: "{colors.warn.600}" },
          focusRing: { value: "{colors.warn.500}" },
        },
      },
    },
    textStyles: {
      // Anything the chain produced renders in mono. See utils/chain-facts.
      chainFact: {
        value: {
          fontFamily: "mono",
          fontSize: "sm",
          letterSpacing: "-0.01em",
        },
      },
    },
  },
  globalCss: {
    "html, body": {
      bg: "bg",
      color: "fg",
    },
    body: {
      fontFamily: "body",
    },
    "::selection": {
      bg: "brand.800",
      color: "fg",
    },
  },
});

export const system = createSystem(defaultConfig, config);
