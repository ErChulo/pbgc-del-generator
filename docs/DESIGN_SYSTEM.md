# Design System — DEL Generator v0.1.0

Source: ErChulo/pbgc-design-system, `tokens/tokens.json` (single
source of truth). Fetched 2026-11-11.

- Version: **v1.1.0 DRAFT** — last updated 2026-11-07, NOT approved.
  For COLA / Section 508 review. Do not treat as approved.
- Tokens file SHA (git blob): `49e4c3c9e2a41bbe50bea204ea71a7d427843ac2`
  (verified by `git hash-object` on the saved copy).
- Latest commit at fetch time: `84a7149d112ef26fcf1e5656b017b9e54f863cb2`
  (2026-11-08, "Add Badge, Accordion, SearchBar, and Footer").
- Local copy: `docs/tokens.json` (byte-identical to the repo file).

## Tokens applied in del-generator.html

- Brand blue `#002D72` (Pantone 288 C) — primary buttons, header bar, links.
- Brand red `#E4002B` — accent only, never error.
- Hover / focus ring `#004B8D`.
- Error `#B3001B`, tint `#FDECEF`. Warning `#8A5700`, tint `#FFF4D6`.
  Success `#008065`, tint `#E6F2EF`. Info tint `#EAF0F8`.
- Ink `#1A1A1A`. Grays `#58585B` / `#D2D2D2` / `#E0E0E0` / `#F2F2F2`.
- Font: `"Helvetica Neue", Arial, sans-serif` (Public Sans withdrawn —
  contradicted the brand, could not load offline).
- H1 2.25rem / H2 1.75rem / H3 1.375rem / body 1rem / small 0.875rem.
- Weights 400 / 700 only. Prose max 60ch. Tabular figures.
- Focus: 3px solid, 2px offset, never box-shadow. Radius 4px.
- 8-point grid. Container max 1400px (token value — the ranking table
  is wide; R5 used 1000px, DEL follows the token).
- CSS transitions only 150 / 250ms. WCAG target 2.2 AA.

## Dark theme (toggle in the header)

- Toggle button in the header: ☾ Dark / ☀ Light. Sets
  `data-theme="dark"` on `<html>`. Choice saved in localStorage
  (`del-theme`); no saved choice means light. Blocked storage never
  kills the app (all access through `delSafeStorage()`).
- Page background **#000** — user override of the provisional night-0
  `#0B1B36`. All other dark values follow the resolved provisional
  tokens: subtle bg night-1 `#12294D`; text `#F2F2F2` / muted `#D2D2D2`;
  link blue-1 `#BEC6DF`; borders night-2 `#1B3866`, input blue-2
  `#8B9FC7`; primary bg blue-1 / fg brand blue; secondary bg night-0;
  danger `#FFB3BD` / `#4D000B`; focus ring white; status accents
  green-2 `#B8D3A7`, warning `#FFD27A`, error `#FFB3BD`.
- Header stays brand blue `#002D72` in both themes.
- **Dark theme is provisional. COLA approval pending.** Do not treat
  as approved.

## HeaderNav

- Skip link first in `<body>`: "Skip to main content", `href="#main"`.
  Hidden until focused. `<main>` has `id="main"`.
- Header: slim blue bar (`#002D72`, both themes). Left to right: the
  white PBGC logo, the app title "DEL Generator" (1.25rem, one line),
  a short subtitle, the theme toggle at the right. Under 640px the
  subtitle hides and the logo shrinks to 32px high so the row fits.
- Nav: links, not buttons. A bar under the header, on the page
  background (white light, `#000` dark). Real links (`#del`,
  `#ranking`) with `data-view`. Current view carries
  `aria-current="page"`. Current link: bold + 3px bottom border
  (brand blue light, blue-1 `#BEC6DF` dark). Other links: blue text,
  underline on hover/focus. 44px targets.
- Narrow screens (max-width 640px): links collapse behind a "Menu"
  disclosure button (`aria-expanded`, `aria-controls`). Escape closes
  the menu and returns focus to the Menu button. A link click closes
  the menu. On wide screens the links show inline and the button is
  hidden.
- The design system says the nav collapses below 1024px. The app
  uses 640px: two links fit inline on a tablet. Recorded here, not
  decided unilaterally.

## Logos

- Official PBGC logos, from Drive folder `images` (folder ID
  `1bQZ0rt6VtbS6vLAlOe2cvt-MxjlPRDML`). Full record:
  `assets/logos/MANIFEST.md`.
- `PBGC_logo_name_hor_fc.png` (Drive ID
  `1Eap0QZJGTMXPJWazlNmgfwhlYidyfDYd`, 13,609 bytes, 750×250) —
  full color. Kept in `assets/logos/` as the light-surface source
  variant. NOT used by the app.
- `PBGC_logo_name_hor_wt.png` (Drive ID
  `1IzmMiz_4Dn9T3gLGd3VSaTKn6d0vvq3H`, 11,712 bytes, 751×251) —
  white. The only logo in the app.
- **Decision (user, 2026-11-11): white logo in the blue header, both
  themes.** The header stays PBGC Blue in both themes, so the header
  logo is the white artwork in both themes — no per-theme switching.
  Per design system §4: "On PBGC Blue: use the white (wt) artwork."
  The white logo is white art, not a white box — the reversed logo,
  made for dark backgrounds.
- Only the wt logo is embedded in `del-generator.html` as a base64
  data URI (single-file constraint). The PNG files are local source
  copies only.
- The logo sits in the blue header, left of the title. Alt text:
  "Pension Benefit Guaranty Corporation". Shown 120px wide (40px
  high, 3:1), above the 60px minimum. Clear space 0.5rem around it.
- Official artwork only. Never redrawn, recolored, outlined, or
  approximated. No white box behind the full-color logo.

## Ambiguous-token choices (recorded, not decided unilaterally)

- Status badges keep a pill radius (999px) vs the token radius 4px —
  same choice as R5 (recorded in R5 OPEN_ITEMS.md §8). Badges are
  small labels, not cards.
- The design system has no component for a match-ranking table row
  (field + matched concept + location + score bar) or for a review
  approve/edit/reject control on a data-element row. Suggestion to
  the design-system team: add both. The design system repo was NOT
  modified; suggest, user decides.
