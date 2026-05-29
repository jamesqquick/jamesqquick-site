---
name: James Q Quick
description: The personal site of James Q Quick, developer, speaker, and teacher.
colors:
  signal-green: "#0AFA94"
  signal-green-hover: "#04cd78"
  text-on-accent: "#0b1020"
  ink: "#f8fafc"
  ink-muted: "#c2cbd8"
  ink-subtle: "#94a3b8"
  stage-navy: "#0b1020"
  surface: "#111830"
  surface-hover: "#17203a"
  section-elevated: "#1a2342"
  border: "#25314d"
  cat-speaking: "#ff6b8a"
  cat-ai: "#35cfff"
  cat-learning: "#0AFA94"
  youtube-red: "#eb3223"
typography:
  display:
    fontFamily: "Space Grotesk Variable, Space Grotesk, Inter, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Space Grotesk Variable, Space Grotesk, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: "Inter Variable, Inter, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 300
    lineHeight: 1.7
    letterSpacing: "0.01em"
  label:
    fontFamily: "IBM Plex Mono, SF Mono, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "0.08em"
rounded:
  input: "10px"
  button: "12px"
  card: "16px"
  hero: "20px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "64px"
components:
  button-primary:
    backgroundColor: "{colors.signal-green}"
    textColor: "{colors.text-on-accent}"
    rounded: "{rounded.button}"
    padding: "0.875rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.signal-green-hover}"
    textColor: "{colors.text-on-accent}"
  button-secondary:
    backgroundColor: "{colors.stage-navy}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "0.875rem 1.5rem"
  button-secondary-hover:
    textColor: "{colors.signal-green}"
  button-tertiary:
    backgroundColor: "{colors.stage-navy}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "0.75rem 1rem"
---

# Design System: James Q Quick

## 1. Overview

**Creative North Star: "The Keynote Studio"**

This is the lit set where a developer-creator records, writes, and takes the stage. The room is dark on purpose: a deep navy stage that makes one electric signal-green spotlight do the talking. The voice is approachable, energetic, and credible, the same three words that drive the brand. Warmth and clarity come from generous type and breathing room; authority comes from restraint, never from shouting. Energy is concentrated into a single accent and a confident display face, not sprayed across the screen.

The system explicitly rejects the bare-Astro-blog default: this is not an unstyled feed of posts, it is a designed hub. It rejects neon overload and gimmickry: the green is a spotlight, not the whole room. It rejects sterile corporate SaaS templates and the smug, negative tone of some creator sites. Every surface should read as unmistakably James: a teacher who respects the audience.

**Key Characteristics:**
- Dark-first stage (deep navy `#0b1020`) with a single high-energy accent.
- One signal-green spotlight (`#0AFA94`) used sparingly for action and emphasis.
- Display type with personality (Space Grotesk) over quiet, readable body (Inter).
- Monospace kickers as a developer-brand signature.
- Soft, rounded surfaces (12-20px) with subtle depth, never heavy.

## 2. Colors

A dark navy stage carrying one electric green accent, with a small set of category hues reserved for content taxonomy. Full dark and light themes both ship; values below are the canonical dark defaults.

### Primary
- **Signal Green** (`#0AFA94`): The spotlight. Primary CTAs, key emphasis, focus rings, link hover fills, and the "learning" content category. The most important color on the site and the visual anchor of the speaking CTA. Hover deepens to **Signal Green Deep** (`#04cd78`). On light theme it shifts to a legible deep green (`#0a7b4b`).
- **Text On Accent** (`#0b1020`): Near-navy text used on filled green surfaces so the accent stays high-contrast and readable.

### Secondary (content categories)
- **Speaking Pink** (`#ff6b8a`): Tags and accents for speaking/talks content.
- **AI Cyan** (`#35cfff`): Tags and accents for AI-related content.

### Tertiary
- **YouTube Red** (`#eb3223`): Reserved strictly for YouTube affordances. Never a general accent.

### Neutral
- **Stage Navy** (`#0b1020`): The page background. The dark room the spotlight needs.
- **Surface** (`#111830`) / **Surface Hover** (`#17203a`): Cards and raised surfaces; hover lifts one tonal step.
- **Section Elevated** (`#1a2342`): Alternating section backgrounds for vertical rhythm.
- **Border** (`#25314d`): Hairline dividers and resting button outlines.
- **Ink** (`#f8fafc`) / **Ink Muted** (`#c2cbd8`) / **Ink Subtle** (`#94a3b8`): Primary, secondary, and tertiary text.

### Named Rules
**The Single Spotlight Rule.** Signal green is emphasis, not decoration. On any given screen it carries roughly one job: the primary action or the single thing that must be seen. If two greens compete, one is wrong.

**The Tinted Neutral Rule.** Never `#000` or `#fff`. Every neutral is tinted toward the navy hue. The dark theme is navy, not black; light text is `#f8fafc`, not pure white.

## 3. Typography

**Display Font:** Space Grotesk Variable (with Inter, system-sans fallback)
**Body Font:** Inter Variable (with system-sans fallback)
**Label/Mono Font:** IBM Plex Mono (with SF Mono, monospace fallback)

**Character:** Space Grotesk brings geometric, slightly quirky personality to headlines, the confident stage voice. Inter keeps body copy calm, neutral, and highly readable. IBM Plex Mono signals "developer" in kickers and eyebrows, the technical fingerprint of the brand.

### Hierarchy
- **Display** (600, `clamp(2.5rem, 6vw, 4.5rem)`, line-height 1.05): Hero headlines. Space Grotesk, tight tracking. The site's loudest voice.
- **Headline** (600, `clamp(1.75rem, 3.5vw, 2.5rem)`, line-height 1.15): Section titles. Space Grotesk.
- **Title** (600, ~1.5rem): Card and sub-section headings.
- **Body** (300, 1.125rem, line-height 1.7): Paragraph copy in Inter, light weight, slightly loose tracking. Cap measure at 65-75ch.
- **Label / Kicker** (400, 0.9375rem, letter-spacing 0.08em, uppercase): IBM Plex Mono eyebrow above sections (`.ds-kicker`).

### Named Rules
**The Mono Kicker Rule.** Eyebrows and section labels are uppercase IBM Plex Mono with wide tracking. This is the developer-brand signature; don't replace it with a sans label.

**The Light Body Rule.** Body copy is Inter weight 300 in `--color-text-muted`, not full-strength ink. Reserve full ink for headings and emphasis.

## 4. Elevation

Depth is quiet and tonal. Surfaces lift through a step in background tone plus a soft, low-opacity shadow paired with a hairline ring; they do not float on heavy drop shadows. Shadow strength is reserved: small and card shadows for resting surfaces, large shadows only for genuinely elevated overlays (modals, popups). Shadows are decomposed into depth-only and ring-only tokens so a surface can take a ring without a drop, or vice versa.

### Shadow Vocabulary
- **Small** (`--shadow-sm`: `0 1px 2px rgba(2,8,20,0.24)` + hairline ring): Subtle resting lift on small surfaces.
- **Card** (`--shadow-card`: `0 8px 20px rgba(2,8,20,0.26)` + ring): Default for cards and raised content.
- **Large** (`--shadow-lg`: `0 14px 34px rgba(2,8,20,0.34)` + ring): Button hover lift and elevated overlays only.
- **Focus** (`--shadow-focus`: `0 0 0 3px rgba(10,250,148,0.28)`): The green focus glow on interactive elements.

### Named Rules
**The Reserved Shadow Rule.** Keep shadows subtle by default. If a component feels too heavy, reduce opacity or blur before touching color contrast. Heavy, high-contrast shadows belong to overlays only.

## 5. Components

### Buttons
- **Shape:** Softly rounded (12px, `--radius-button`). Inline-flex, centered, 1rem gap for icon + label.
- **Primary:** Filled signal green (`#0AFA94`) with near-navy text (`#0b1020`). Padding `0.875rem 1.5rem` at desktop. The speaking CTA and key actions.
- **Secondary:** Transparent with a `--color-border` outline and ink text. Hover shifts border and text to green over a faint green-subtle wash.
- **Tertiary:** Borderless, ink text, green on hover. For low-emphasis actions.
- **Hover / Focus:** All buttons lift 2px on hover with a large shadow; active returns to 0. Focus-visible draws a 2px green outline (offset 2px) plus the green focus glow.

### Links
- **Fancy link (default):** Inline-block with a 1px baseline underline in ink that, on hover, expands into a full rounded signal-green fill while text flips to navy. The signature interactive flourish; mirrored for prose links via `.ds-prose a`.
- **Simple link:** Inherits color, turns green on hover.

### Cards / Containers
- **Corner Style:** 16px (`--radius-card`).
- **Background:** `--color-surface` (`#111830`), lifting to `--color-surface-hover` on interaction.
- **Shadow Strategy:** `--shadow-card` at rest (see Elevation). Never stack heavy shadows on nested elements; nested cards are forbidden.
- **Internal Padding:** 24px baseline, on the approved rhythm.

### Inputs / Fields
- **Style:** `--color-surface` background, `--color-border` stroke, 10px radius (`--radius-input`).
- **Focus:** 2px green outline plus the green focus glow. Never rely on color alone.

### Navigation
- **Style:** Transparent 100px-tall bar, logo left, text links right (About, Blog, Speaking, Courses, Uses) plus a theme toggle. Links are ink, turning green on hover. Mobile collapses to a full-screen `--color-bg` overlay menu.

### Section
- **Behavior:** A `Section` primitive owns vertical rhythm via `paddingY` presets (`half` / `default` / `spacious` / `xl`) and a `tone` (`base` / `elevated`). Alternate `base` and `elevated` tones to build rhythm; never hand-roll `py-*` or `bg-*` on sections.

## 6. Do's and Don'ts

### Do:
- **Do** make the speaking CTA the most prominent action on any page it appears, using the primary green button.
- **Do** keep signal green to roughly one job per screen (The Single Spotlight Rule).
- **Do** use IBM Plex Mono uppercase kickers above sections for the developer-brand signature.
- **Do** set body copy in Inter 300 at `--color-text-muted`, capped at 65-75ch.
- **Do** build vertical rhythm by alternating `Section` `base` and `elevated` tones with `paddingY` presets.
- **Do** give every interactive element a visible green `:focus-visible` ring; never rely on color alone for meaning.
- **Do** keep both dark (default) and light themes readable, and respect `prefers-reduced-motion`.

### Don't:
- **Don't** ship the bare-Astro / Bear-blog text-only look. This is a designed hub, not an unstyled feed.
- **Don't** let the brand read as loud, neon-overloaded, or gimmicky. The green is a spotlight, not the room.
- **Don't** adopt a smug, negative, or disrespectful tone in copy. Respect for the audience is non-negotiable.
- **Don't** drift into sterile corporate / generic SaaS template territory.
- **Don't** use `#000` or `#fff`; tint every neutral toward the navy hue.
- **Don't** nest cards or stack heavy shadows; reserve large shadows for overlays only.
- **Don't** use a `border-left`/`border-right` colored stripe as an accent; use full borders, tints, or the green focus treatment instead.
- **Don't** repurpose YouTube red or category hues (pink, cyan) as general accents.
