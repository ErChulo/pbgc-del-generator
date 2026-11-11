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
- **No dark theme shipped** (v1.1.0 dark theme is provisional — must
  not ship without COLA approval).

## Ambiguous-token choices (recorded, not decided unilaterally)

- Status badges keep a pill radius (999px) vs the token radius 4px —
  same choice as R5 (recorded in R5 OPEN_ITEMS.md §8). Badges are
  small labels, not cards.
- The design system has no component for a match-ranking table row
  (field + matched concept + location + score bar) or for a review
  approve/edit/reject control on a data-element row. Suggestion to
  the design-system team: add both. The design system repo was NOT
  modified; suggest, user decides.
