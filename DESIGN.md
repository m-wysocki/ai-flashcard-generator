---
name: Drawn Playful System
colors:
  surface: '#fef9ea'
  surface-dim: '#dedacc'
  surface-bright: '#fef9ea'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f4e5'
  surface-container: '#f2eedf'
  surface-container-high: '#ece8d9'
  surface-container-highest: '#e6e3d4'
  on-surface: '#1d1c13'
  on-surface-variant: '#58423d'
  inverse-surface: '#323127'
  inverse-on-surface: '#f5f1e2'
  outline: '#8b716b'
  outline-variant: '#dfc0b9'
  surface-tint: '#a73921'
  primary: '#a73921'
  on-primary: '#ffffff'
  primary-container: '#ff7a5c'
  on-primary-container: '#711300'
  inverse-primary: '#ffb4a3'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fcd664'
  on-secondary-container: '#745c00'
  tertiary: '#5f5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#a3a1a1'
  on-tertiary-container: '#383838'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a3'
  on-primary-fixed: '#3d0600'
  on-primary-fixed-variant: '#86220c'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e7c353'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474747'
  background: '#fef9ea'
  on-background: '#1d1c13'
  surface-variant: '#e6e3d4'
typography:
  headline-xl:
    fontFamily: Quicksand
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  body-lg:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-lg:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
---

## Brand & Style

This design system embraces a "Neo-Brutalist Comic" aesthetic. It is designed to feel tactile, hand-drawn, and approachable, moving away from the clinical precision of standard SaaS interfaces. The personality is friendly, optimistic, and high-energy, making it ideal for travel, lifestyle, or consumer-facing mobile applications.

The visual style is characterized by "hard-line" illustrations. It uses thick, consistent strokes to define boundaries and flat, offset shadows to create depth without using gradients or blurs. The goal is to evoke the nostalgic feeling of a high-quality physical comic book or a modern indie video game.

**Key Stylistic Pillars:**
- **Illustrative Borders:** Everything has a defined 2px black outline to create a "drawn" feel.
- **Flat Depth:** Depth is achieved through rigid X/Y offsets rather than soft shadows.
- **Warmth:** A paper-like background ensures the high-contrast ink lines feel comfortable rather than harsh.

## Colors

The palette is built around high-contrast "Ink" and warm "Paper" tones, accented by muted but vibrant pastels.

- **Primary (#FF7A5C):** A soft coral used for the most important calls to action. It should always be paired with a thick black border.
- **Secondary (#FFD966):** A sunny yellow used for supportive actions and highlights.
- **Neutral/Surface (#F3EFE0):** A warm beige that acts as the primary container color, mimicking the look of recycled paper or cardstock.
- **Ink (#1A1A1A):** The essential color for all borders, shadows, and primary text. Never use pure black (#000000) to keep the "hand-drawn" look slightly softer.

## Typography

This design system uses **Quicksand** for all levels to maintain a consistent, rounded, and friendly voice. 

- **Weight Usage:** Headlines should strictly use the Bold (700) weight to stand up against the thick 2px borders of the UI. Body text uses Medium (500) for better legibility against the off-white background.
- **Casing:** Labels and small UI hints should often use `uppercase` to lean into the comic-book aesthetic.
- **Color:** Most text should be in the "Ink" color. For the Primary/Secondary buttons, text remains "Ink" to ensure maximum contrast and readability against the pastel backgrounds.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous margins to allow the "drawn" elements room to breathe. 

- **Rhythm:** An 8px base grid is used for all internal component spacing.
- **Margins:** On mobile, use a 20px side margin. On desktop, content is contained within a max-width of 1200px.
- **Gutters:** Standard gutter between cards and columns is 16px.
- **Padding:** Components should have "loose" internal padding (minimum 16px) to maintain the playful, un-cramped feel.

## Elevation & Depth

This design system rejects blurred shadows in favor of **Hard-Offset Shadows**. Depth is used to indicate interactivity.

- **The Shadow Style:** Shadows are solid #1A1A1A with 100% opacity.
- **Resting State:** Elements like cards and primary buttons have a 4px offset to the bottom and 4px to the right.
- **Active/Hover State:** When pressed, the offset decreases to 1px or 2px, and the element "moves" toward the shadow, creating a tactile "click" sensation.
- **Layering:** Background elements have no shadow. Interactive elements have the standard 4px shadow. Floating elements (modals) have an 8px shadow.

## Shapes

The shape language is "Soft-Geometric." While the outlines are harsh and black, the corners are always rounded to maintain the friendly brand voice.

- **Corners:** Use a standard 0.5rem (8px) radius for most containers. 
- **Large Elements:** Featured cards or banners can use up to 1rem (16px) for a more "pillowy" look.
- **Borders:** Every shape must have a solid 2px border in the "Ink" color. 
- **Irregularity:** To enhance the hand-drawn feel, secondary decorative elements may use slightly asymmetrical border radii (e.g., 8px top-left, 12px bottom-right).

## Components

### Buttons
- **Primary:** Coral background, 2px ink border, 4px black offset shadow. Pill-shaped.
- **Secondary:** Yellow background, 2px ink border, 4px black offset shadow. Pill-shaped.
- **Text:** Bold Quicksand, centered.
- **Interaction:** On press, the button translates +2px X and +2px Y, and the shadow size shrinks.

### Cards & Containers
- **Main Surface:** Beige (#F3EFE0) background with 2px black border.
- **Shadow:** 4px offset black shadow.
- **Header:** Use Headline-MD for titles within cards.

### Input Fields
- **Style:** White background, 2px black border, 8px rounded corners.
- **Focus:** Border weight remains 2px but the shadow offset increases to 4px to show "lift."

### Progress Bars
- **Container:** White background, 2px black border, 12px height, fully rounded.
- **Indicator:** Primary Coral fill, no border on the inner fill.

### Chips/Tags
- **Style:** Small, fully rounded (pill) containers with 1px or 2px borders.
- **Color:** Transparent with black border or Secondary Yellow for "Active" states.