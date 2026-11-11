# DEL Generator — Data Element Listing

![Tests: 183 passing](https://img.shields.io/badge/tests-183%20passing-brightgreen)
![Unit tests: 75 passing](https://img.shields.io/badge/unit%20tests-75%20passing-brightgreen)
![Browser tests: 108 passing](https://img.shields.io/badge/browser%20tests-108%20passing-brightgreen)
![DOCX checks: passing](https://img.shields.io/badge/docx%20checks-passing-brightgreen)
![Network calls: 0](https://img.shields.io/badge/network%20calls-0-brightgreen)
![Version: v0.1.0](https://img.shields.io/badge/version-v0.1.0-blue)

Badges show grades measured on v0.1.0. Update badges when tests change.

## Purpose

Write the DEL — the Data Element Listing — from plan documents. A DEL lists all fields a PBGC case needs, and where each field comes from. Wish list: every field the plan could need, not only census fields. Universe: all Input fields, BCV Data Dictionary Complete (220 Input + 51 Input|Calculated). This version: the template's 56 fields. Schema accepts any Input field.

## End result

A filled DEL Word document: `<case>DEL.docx`, e.g. `98765400DEL.docx`. 3 tables: header (11×2), sources, elements (58×7). Plus an audit log.

## How to use

Open `del-generator.html` in a browser, straight from disk (`file://`). No server. No install. No data leaves the page. One HTML file. Theme toggle in the header: dark or light.

1. **Download prompt** — scraper prompt for the LLM.
2. **Upload JSON** — JSON from the LLM, or flat JSON, or an OCR payload. Partial JSON fills only missing fields.
3. **Review** — each field: Approve / Edit / Reject. Unmapped keys listed, never dropped. Conflicts become ambiguous, never merged.
4. **Generate** — locked until header (plan name, case number, DOPT) is filled and each field has a decision.
5. **Download** — filled `<case>DEL.docx` + audit log. Share button on devices that support it.

Second view: **Match ranking**. Field | matched concept + location | similarity score. Highest first. Score counts shared words and phrases. It ranks, never decides. Low-score and unmatched fields listed on their own, never dropped.

Loop, in one line: LLM proposes. App checks. You decide. App writes the Word document from approved JSON only. No LLM in the generation path.

Demo case: synthetic. Riverbend Manufacturing Pension Plan, Plan No. 001, case 98765400, DOPT 2025-06-30. Same invented plan as the R5 generator. No real plan identity anywhere.

## Files

| Path | What it is |
| --- | --- |
| `del-generator.html` | Deliverable. One `<style>`, one `<script>`, all data embedded. |
| `schema/del.schema.json` | DEL JSON schema (draft). Accepts any Input field. |
| `prompts/del-scraper-prompt.md` | Scraper prompt (also embedded in the HTML). |
| `docs/tokens.json` | PBGC Design System tokens used (v1.1.0 DRAFT, not approved). |
| `docs/DESIGN_SYSTEM.md` | Which tokens, which version, which choices. |
| `docs/DEL_NOTES.md` | DEL definition, template mapping, statuses, provenance. |
| `docs/HOW_IT_WORKS.md` | End-to-end mechanics: user actions and app behavior. |
| `scripts/build_single_file.py` | Injects the prompt into the HTML; runs safety checks. |
| `scripts/gen_demo_docx.cjs` | Generates the demo .docx through the HTML's own code. |
| `scripts/verify_docx.py` | Checks the generated .docx with python-docx. |
| `tests/run.cjs` | Unit tests (70). |
| `tests/browser.cjs` | Browser tests (63, jsdom). |
| `package.json` | Test command (`npm test`), jsdom dev dependency. |
| `assets/logos/` | Source PNGs + MANIFEST.md. Embedded in the HTML as data URIs. |
| `OPEN_ITEMS.md` | Gap list. Read it before next steps. |

## Design system

PBGC Design System **v1.1.0 DRAFT** (not approved). Tokens from `ErChulo/pbgc-design-system`, commit `84a7149d112ef26fcf1e5656b017b9e54f863cb2` (2026-11-08), blob SHA `49e4c3c9e2a41bbe50bea204ea71a7d427843ac2` (byte-identical). Brand blue #002D72. Helvetica Neue/Arial. WCAG 2.2 AA. Dark theme: toggle in the header. Dark background #000. Logos: white PBGC logo in the blue header, both themes. Header: slim blue bar, logo + compact title, theme toggle. Nav: links under the header (DEL generator / Match ranking / Welcome / Help), Menu button on small screens. Design-system repo not modified.

## Tests

```sh
npm test                              # 75 unit + 108 browser checks
python3 scripts/verify_docx.py        # demo .docx checks
python3 scripts/build_single_file.py  # re-inject prompt, run safety checks
```

## Verified — v0.1.0

- `npm test`: **183 passed, 0 failed** (75 unit + 108 browser).
- `node --check` on the HTML script: passes.
- `python3 scripts/verify_docx.py`: all checks pass. 3 tables (header 11×2, sources 6×3, elements 58×7). Header filled. No placeholder text.
- Grep: 0 `fetch(`, 0 `<script src`, 0 `<link>`, 0 `import(`, no external URLs. Only `http://` strings: OOXML namespace URIs in the .docx builder — identifiers, not fetches.
- Browser test: page loads in jsdom on an opaque origin (file: URL). Demo button loads the demo case, moves to Review.
- Theme toggle: flips data-theme, dark page #000, header stays brand blue, choice persists.
- Logo: one white PBGC logo in the blue header, both themes, alt text set, 156px wide (52px high).
- Header/nav: skip link first, nav links with aria-current, hash links + hashchange, Menu disclosure on small screens with Escape + focus return.

## Not verified

- Not opened in a real browser. Stepper, review buttons, file picker, Share button: not clicked in a real browser.
- Not run against a real LLM. Simulated payloads only. First real Copilot/LLM payload will show what the prompt gets wrong.
- Not run in the office. file:// constraint designed in, not tested there.

## Fixed in v0.1.0

- Try demo did nothing (iPhone): script touched localStorage at top level. On an opaque origin that throws, kills the whole script. Fixed: `delSafeStorage()` — all storage access in try/catch, fallback to no persistence. Regression test: `tests/browser.cjs`.
- Full DEL JSON import treated the validator result as an array. Invalid JSON would pass. Fixed: use `.errors`.
- Exact field names (`RETSTAT`, `PA_AMB`) did not resolve in flex import. Fixed: normalized-name map.
- Element with no match was scored against other elements' passages. Fixed: no match → unmatched.
- Ranking view treated the ranking result as an array. Fixed: result is `{ranked, unmatched}`. Row now shows the scored passage.
- Condition starting with "if" got a second "If" in the .docx ("If if a QDRO exists"). Fixed.
- OCR envelope set a status word ("present") as its own passage. Fixed: status word gets a passage only from real evidence.
