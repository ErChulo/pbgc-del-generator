# Logo assets — MANIFEST

Source: Google Drive, "PBGC the book of job", folder `images`
(folder ID `1bQZ0rt6VtbS6vLAlOe2cvt-MxjlPRDML`). Downloaded 2026-11-11.

## Files used in the app

| File | Drive ID | Bytes | Size | Use |
| --- | --- | --- | --- | --- |
| `PBGC_logo_name_hor_fc.png` | `1Eap0QZJGTMXPJWazlNmgfwhlYidyfDYd` | 13,609 | 750×250 | Full color, horizontal with agency name. Light theme. |
| `PBGC_logo_name_hor_wt.png` | `1IzmMiz_4Dn9T3gLGd3VSaTKn6d0vvq3H` | 11,712 | 751×251 | White, horizontal. Dark theme (background #000). |

Design system rule: web header uses the horizontal logo with agency
name. Alt text: "Pension Benefit Guaranty Corporation". Minimum width
0.625 in (60px). Clear space equals the width of the "P".
Official artwork only — never redrawn, recolored, outlined, or
approximated.

## How the app carries them

The app is a single HTML file (office constraint: file://, no fetch).
Both PNGs are embedded in `del-generator.html` as base64 data URIs.
These PNG files are the local source copies only. They are binary and
cannot go through the snapshot push (UTF-8 text only); the HTML carries
the logos.

## Not used

- `logo-negro.png` — provenance unconfirmed (design system critique).
- `logo1.png`, `logo2.png`, `logo3.png`, `logo.svg` — provenance unclear.
- EPS masters (`PBGC-Logo-Tagline-FullColor.eps`,
  `PBGC-Logo-FullColor.eps`) — print masters, not web-usable.
- Other variants in the same Drive folder (tagline, notag, banner,
  words-only, bw) — not needed for the web header.
