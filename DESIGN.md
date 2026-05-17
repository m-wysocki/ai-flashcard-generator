---
name: Moss & Forest Botanical
colors:
  surface: '#fff8f4'
  surface-dim: '#e1d9d2'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2eb'
  surface-container: '#f5ece5'
  surface-container-high: '#efe7e0'
  surface-container-highest: '#eae1da'
  on-surface: '#1f1b17'
  on-surface-variant: '#45483b'
  inverse-surface: '#34302b'
  inverse-on-surface: '#f8efe8'
  outline: '#757969'
  outline-variant: '#c5c8b6'
  surface-tint: '#506619'
  primary: '#506619'
  on-primary: '#ffffff'
  primary-container: '#90a955'
  on-primary-container: '#2c3c00'
  inverse-primary: '#b6d178'
  secondary: '#45673e'
  on-secondary: '#ffffff'
  secondary-container: '#c3ebb7'
  on-secondary-container: '#496b42'
  tertiary: '#675c55'
  on-tertiary: '#ffffff'
  tertiary-container: '#ab9d95'
  on-tertiary-container: '#3e352f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2ed91'
  primary-fixed-dim: '#b6d178'
  on-primary-fixed: '#151f00'
  on-primary-fixed-variant: '#394d00'
  secondary-fixed: '#c6edba'
  secondary-fixed-dim: '#aad19f'
  on-secondary-fixed: '#022103'
  on-secondary-fixed-variant: '#2d4e29'
  tertiary-fixed: '#efdfd6'
  tertiary-fixed-dim: '#d3c4bb'
  on-tertiary-fixed: '#221a15'
  on-tertiary-fixed-variant: '#4f453e'
  background: '#fff8f4'
  on-background: '#1f1b17'
  surface-variant: '#eae1da'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is rooted in the "Moss & Forest Botanical" aesthetic, prioritizing a calm, organic, and professional atmosphere for a premium language learning experience. It leverages a modern-minimalist approach with subtle tactile influences, evoking the quiet focus of a nature-inspired study space.

The target audience seeks a sophisticated, distraction-free environment. The UI should feel grounded and rhythmic, using generous whitespace (beige) and deep botanical tones to guide the user through their educational journey without the friction of loud, digital-first interfaces.

## Colors
This design system utilizes a natural, high-contrast palette to ensure legibility and brand character.

- **Primary (#90A955):** Moss Green. Used for primary actions, progress indicators, and active states. It represents growth and momentum.
- **Secondary (#2E4F29):** Forest Green. Reserved for high-contrast elements, headers, and structural borders. It provides the "ink" for the system.
- **Surface (#EDDDD4):** Warm Beige. The primary background color for all screens. It reduces eye strain compared to pure white.
- **Text:** Primarily Forest Green (#2E4F29) for headings and body to maintain the botanical theme. A muted dark neutral is used for secondary metadata.

## Typography
Manrope is chosen for its geometric clarity and modern humanist terminals, which bridge the gap between technical precision and organic friendliness. 

Headings should use tighter letter-spacing and heavier weights to feel impactful against the light beige surfaces. Body text maintains a generous line height to enhance readability during long learning sessions. All typography defaults to Forest Green (#2E4F29) to ensure a premium, integrated look.

## Layout & Spacing
The layout follows a **fluid grid** model with a 12-column structure for desktop and a 4-column structure for mobile. 

The spacing rhythm is based on an 8px baseline. Vertical rhythm is critical; use larger gaps (64px+) between major content sections to maintain the "calm" brand pillar. Content should be centered with maximum widths to prevent line lengths from becoming unreadable on ultra-wide displays.

## Elevation & Depth
In alignment with the botanical theme, depth is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Base):** Warm Beige (#EDDDD4) surface.
- **Level 1 (Cards/Containers):** A slightly lighter tint of the surface color or a pure white surface with a 1px border in Forest Green (#2E4F29) at 15% opacity.
- **Level 2 (Interactive):** When hovered or active, elements use a soft, diffuse shadow tinted with Moss Green to suggest a natural "lift" from the page.

## Shapes
The shape language is "Rounded," utilizing a 0.5rem (8px) base radius. This creates a friendly but disciplined appearance. Buttons and input fields should feel substantial and soft to the touch, avoiding the clinical feel of sharp corners or the overly casual look of full pill shapes.

## Components

### Buttons
- **Primary:** Moss Green (#90A955) background with White or Beige text. Bold weight.
- **Secondary:** Transparent background with a 2px Forest Green (#2E4F29) border.
- **Ghost:** Forest Green text with no background, used for less critical actions like "Cancel" or "Skip."

### Cards
Cards use a white background to pop against the beige surface. They feature a 1px stroke in a muted Forest Green. Padding should be generous (min 24px) to emphasize the premium feel.

### Input Fields
Inputs use the beige surface as the fill, with a Forest Green bottom border that expands to a full stroke on focus. Labels use the `label-md` style in Forest Green.

### Chips & Tags
Small, rounded indicators using a light Moss Green tint (20% opacity) with dark Forest Green text. Used for language levels (e.g., "A1", "B2") or category filtering.

### Progress Bars
Track is a 10% opacity Forest Green; the indicator is solid Moss Green. The ends should be rounded to match the system's shape language.