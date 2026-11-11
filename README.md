# DEL Generator — Data Element Listing

**Version 0.1.0 — walking skeleton.** The full loop works end to end:
download the scraper prompt → feed it and the plan documents to any LLM
→ upload the JSON the LLM returns → review every field → generate the
filled DEL Word document.

## What it is

A DEL (Data Element Listing) is the table of all the fields a PBGC case
needs, and where each one comes from. It is a wish list: every field the
plan could need, not only the ones in the census. The DEL universe is all
Input fields from the BCV Data Dictionary Complete (220 Input + 51
Input|Calculated). This version covers the template's 56 fields; the
schema already accepts any Input field.

## How to use it

Open `del-generator.html` in a browser, straight from disk (`file://`).
No server, no install, no data leaves the page. Five steps, always
visible:

1. **Download prompt** — the scraper prompt for the LLM.
2. **Upload JSON** — the JSON the LLM returned, or a flat JSON, or an
   OCR payload. A partial JSON only fills fields that are still missing.
3. **Review** — every field, with Approve / Edit / Reject. Unmapped keys
   are listed, never dropped. Conflicts become ambiguous, never merged.
4. **Generate** — locked until the header (plan name, case number, DOPT)
   is filled and every field has a decision.
5. **Download** — the filled `DEL_<case>.docx`, plus the audit log. A
   Share button appears on devices that support it.

There is a second view, **Match ranking**: field | matched concept +
location | similarity score, highest first. The score is a plain count
of shared words and phrases — it ranks, it never decides. Low-score and
unmatched fields are listed on their own, never dropped.

The demo case is synthetic: Riverbend Manufacturing Pension Plan,
Plan No. 001, case 98765400, DOPT 2025-06-30 — the same invented plan as
the R5 generator, for cross-module consistency. No real plan identity
anywhere.

## The loop, in one line

The LLM proposes. The app checks. You decide. The app writes the Word
document from approved JSON only. No LLM in the generation path.

## Files

| Path | What it is |
| --- | --- |
| `del-generator.html` | The deliverable. One `<style>`, one `<script>`, all data embedded. |
| `schema/del.schema.json` | The DEL JSON schema (draft). Extensible to any Input field. |
| `prompts/del-scraper-prompt.md` | The downloadable scraper prompt (also embedded in the HTML). |
| `docs/tokens.json` | PBGC Design System tokens used (v1.1.0 DRAFT, not approved). |
| `docs/DESIGN_SYSTEM.md` | Which tokens, which version, which choices. |
| `docs/DEL_NOTES.md` | DEL definition, template mapping, statuses, provenance. |
| `scripts/build_single_file.py` | Injects the prompt into the HTML; runs the safety checks. |
| `scripts/gen_demo_docx.cjs` | Generates the demo .docx through the HTML's own code. |
| `scripts/verify_docx.py` | Checks the generated .docx with python-docx. |
| `tests/run.cjs` | The test suite. |
| `OPEN_ITEMS.md` | The canonical gap list. Read it before proposing next steps. |

## Design system

PBGC Design System **v1.1.0 DRAFT** (not approved), tokens from
`ErChulo/pbgc-design-system` at commit
`84a7149d112ef26fcf1e5656b017b9e54f863cb2` (2026-11-08), blob SHA
`49e4c3c9e2a41bbe50bea204ea71a7d427843ac2` (verified byte-identical).
Brand blue #002D72, Helvetica Neue/Arial, WCAG 2.2 AA, no dark theme.
The design system has no component for a match-ranking table row or a
review approve/edit/reject control — that is a suggestion for the
design-system team, recorded in `docs/DESIGN_SYSTEM.md`. The
design-system repo was not modified.

## Tests

```sh
node tests/run.cjs                    # 70 checks, exits non-zero on failure
python3 scripts/verify_docx.py      # generates the demo .docx, checks it with python-docx
python3 scripts/build_single_file.py  # re-inject the prompt, run the safety checks
```

## What was verified for v0.1.0

- `node tests/run.cjs`: **70 passed, 0 failed** (schema + demo, validator
  accept/reject, flex import incl. OCR envelope, partial merge, scorer,
  ranking, .docx bytes, embedded prompt).
- `node --check` on the HTML's script: passes.
- `python3 scripts/verify_docx.py`: all checks pass — 3 tables
  (header 11×2, sources 6×3 for the demo's 5 sources, elements 58×7),
  header filled, elements filled, no placeholder text.
- Grep: 0 `fetch(`, 0 `<script src`, 0 `<link>`, 0 `import(`, no external
  URLs. (The only `http://` strings are OOXML namespace URIs inside the
  .docx builder — identifiers, not fetches.)

## What was NOT verified

- **Not opened in a real browser.** Verification was by `node --check`,
  a Node vm harness, and python-docx. The stepper, review buttons, file
  picker, and Share button have not been clicked anywhere.
- **Not run against a real LLM.** The prompt and the import were tested
  with simulated payloads only. The first real Copilot/LLM payload will
  show what the prompt gets wrong.
- **Not run in the office.** The file:// constraint is designed in, not
  tested there.

## Bugs found and fixed during v0.1.0 verification

- The import of a full DEL JSON called the validator's result an array;
  invalid JSON would have been accepted. Fixed to use `.errors`.
- Exact field names (`RETSTAT`, `PA_AMB`) did not resolve in the flex
  import: the normalized key is lowercase and underscore-free, the field
  names are not. Fixed with a normalized-name map.
- An element with no match was scored against other elements' passages
  instead of being listed unmatched. Fixed: no match → unmatched.
- The ranking view treated the ranking result as an array; it is
  `{ranked, unmatched}`. Fixed, and the row now shows the scored
  passage (with a note when it differs from the proposed one).
- A condition starting with "if" got a second "If" in the .docx
  ("If if a QDRO exists"). Fixed.
- The OCR envelope set a status word ("present") as its own passage.
  Fixed: a status word only gets a passage from real evidence.
