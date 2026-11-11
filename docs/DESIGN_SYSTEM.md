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

## Logos

- Official PBGC logos, from Drive folder `images` (folder ID
  `1bQZ0rt6VtbS6vLAlOe2cvt-MxjlPRDML`). Full record:
  `assets/logos/MANIFEST.md`.
- `PBGC_logo_name_hor_fc.png` (Drive ID
  `1Eap0QZJGTMXPJWazlNmgfwhlYidyfDYd`, 13,609 bytes, 750×250) —
  full color, light theme.
- `PBGC_logo_name_hor_wt.png` (Drive ID
  `1IzmMiz_4Dn9T3gLGd3VSaTKn6d0vvq3H`, 11,712 bytes, 751×251) —
  white, dark theme.
- Both embedded in `del-generator.html` as base64 data URIs
  (single-file constraint). The PNG files are local source copies only.
- Logos sit on the page background at the top of the main content, not
  in the blue topbar. Full color on white, white on `#000`. They switch
  with the theme (CSS, `data-theme`). Alt text: "Pension Benefit
  Guaranty Corporation". Shown 120px wide (40px high, 3:1), above the
  60px minimum. Clear space around them.
- Full-color text is dark blue (RGB 30, 55, 109) — unreadable directly
  on the blue topbar. That is why the logo sits on the page background.
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
