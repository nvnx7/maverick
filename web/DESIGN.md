---
name: Maverick Technical Identity
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#0050cc'
  on-secondary: '#ffffff'
  secondary-container: '#0266ff'
  on-secondary-container: '#f9f7ff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1b1a'
  on-tertiary-container: '#868381'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#dae1ff'
  secondary-fixed-dim: '#b3c5ff'
  on-secondary-fixed: '#001849'
  on-secondary-fixed-variant: '#003fa4'
  tertiary-fixed: '#e6e1df'
  tertiary-fixed-dim: '#cac6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  surface-neutral: '#F9F9F9'
  border-subtle: '#E5E5E5'
  success-green: '#10B981'
  data-mono: '#666666'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
spacing:
  unit: 4px
  gutter: 24px
  margin-edge: 40px
  container-max: 1280px
---

## Brand & Style
The design system reflects a high-conviction, enterprise-grade infrastructure for AI data. It is engineered to evoke feelings of technical precision, institutional reliability, and absolute transparency. Drawing inspiration from financial data platforms and developer-centric utilities, the aesthetic is **Technical Minimalism**.

The style is characterized by:
- **Extreme Precision:** Sharp edges and 1px strokes replace the "softness" of consumer SaaS.
- **Data-First Hierarchy:** Functional information takes precedence over decorative elements.
- **Architectural Whitespace:** Generous margins are used to create a sense of scale and clarity, preventing the UI from feeling cluttered despite high information density.
- **Infrastructure Aesthetic:** Subtle grid lines and monospaced accents suggest a system that is "under the hood" of the global AI economy.

## Colors
The palette is strictly functional. It utilizes a high-contrast monochromatic base to ensure legibility and a "document-like" feel.

- **Primary & Neutrals:** The core of the system is built on `#141414` (Deep Onyx) for text and branding, set against `#FFFFFF` (White). `#F9F9F9` is used for large background sections to reduce eye strain, while `#E5E5E5` provides the definition for the 1px grid system.
- **Accents:** 'Maverick Blue' (#0066FF) is reserved exclusively for primary calls-to-action and active states. 'Success Green' (#10B981) is used for positive data deltas and system status indicators.
- **Application:** Avoid gradients. Color should be applied in solid blocks or thin lines to maintain the technical, unembellished aesthetic.

## Typography
The typography system uses a tri-font approach to differentiate between branding, content, and data metadata.

- **Headlines (Geist):** A sharp, technical sans-serif used for impact and "high-conviction" statements. Use bold weights to establish a clear hierarchy.
- **Body (Inter):** The workhorse for all long-form content and UI labels. It provides exceptional legibility at small sizes.
- **Data & Metadata (JetBrains Mono):** Used for IDs, timestamps, code snippets, and numerical data to reinforce the "data marketplace" context.
- **Formatting:** Keep letter spacing tight on headlines to emphasize the "strong" brand voice, and slightly expanded on monospaced labels for readability.

## Layout & Spacing
This design system employs a **Fixed Grid** philosophy for desktop to maintain the structural integrity of complex data tables and dashboards.

- **Grid System:** A 12-column grid with a 24px gutter. All components should align to a 4px baseline shift to ensure mathematical consistency.
- **Structural Lines:** Use 1px borders (`#E5E5E5`) to define sections instead of heavy shadows or background changes. This creates a "blueprint" feel.
- **Responsive Behavior:** 
  - **Desktop:** 40px outer margins, 1280px max-width.
  - **Tablet:** 24px outer margins, fluid columns.
  - **Mobile:** 16px outer margins, single-column stack. Typography scales down (e.g., `headline-lg` becomes `headline-lg-mobile`).

## Elevation & Depth
In keeping with the minimalist and technical requirements, depth is conveyed through **Tonal Layers** and **Bold Borders** rather than shadows.

- **The Z-Axis:** Elevation is represented by stacking flat surfaces. A "raised" element (like a modal) is defined by a 1px solid black border and a white fill, rather than a shadow.
- **Interaction Shading:** Hover states should use subtle tonal shifts (e.g., White to `#F9F9F9`) or 1px border weight increases.
- **Shadow Exception:** If a shadow is absolutely required for accessibility on floating elements, use a "Hard Shadow": a 2px offset with 0 blur in `#000000` at 10% opacity, maintaining the sharp, architectural look.

## Shapes
The shape language is strictly **Sharp (0px)**. 

- **Zero Radius:** All buttons, input fields, cards, and containers must have 0px corner radii. This distinguishes the product from the common "soft" SaaS aesthetic and aligns with the aggressive, shard-like geometry of the Maverick logo.
- **Icons:** Use thin-stroke (1.5px) linear icons with mitered (sharp) joins and caps. Avoid rounded terminals.

## Components
Consistent component styling reinforces the enterprise-grade nature of the system.

- **Buttons:** Rectangular with 0px radius. 
  - *Primary:* Solid Black background, White text.
  - *Secondary:* 1px Black border, Transparent background.
- **Input Fields:** 1px `#E5E5E5` border that turns 1px `#0066FF` on focus. Use JetBrains Mono for placeholder text to signal a "data-entry" environment.
- **Cards:** No shadows. Defined by a 1px `#E5E5E5` border. For "featured" data sets, use a 1px Black border.
- **Data Tables:** The core component. Use a 1px horizontal rule between rows. Headers should be in `label-mono` with a light gray background (`#F9F9F9`).
- **Chips/Tags:** Sharp corners, 1px border, `label-mono` typography. Status tags use `success-green` for "Verified" or "Active" states.
- **Graphs/Charts:** Use thin lines, no fills (area charts should use very low opacity), and sharp vertices.