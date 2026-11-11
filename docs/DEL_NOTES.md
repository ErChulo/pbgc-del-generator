# DEL Notes — v0.1.0

## What DEL is

DEL = Data Element Listing. A table of all the fields necessary to do
PBGC work, especially the calculation of liabilities and future
pensioners. It is a wish list: all fields that CAN be scraped from the
historical plan documents (and any other auxiliary documentation from
the plan), not only the ones that exist and are used currently in the
census, including ones not present in the census for contingency
reasons. DEL is the exercise of matching all Data Dictionary Complete
fields to what can be scraped from the plan documents. All of them.

The DEL is not the census: the census is the data (participant rows);
the DEL is the list of fields needed and where each comes from.

## Universe

ALL Input fields from the BCV Data Dictionary Complete: 220 Input +
51 Input|Calculated. The 834 Calculated fields are derived, not
collected, so they are not in the universe. "All of them" = all input
fields the plan's provisions could require.

v0.1.0 covers the template's 56 elements. The prompt must grow to the
full Input universe, one field group at a time (see OPEN_ITEMS.md).

## Template mapping (data-elements-list.docx)

- 6 empty paragraphs, 3 tables.
- Table 0 (11 rows × 2 cols) — header. Label in column 0, value in
  column 1. Row 0 is the title ("Data Elements and Sources List").
  Row 6 is preset "Processing Division: ASD-D". Row 8 lists the
  source documents. Row 10 is the narrative.
- Table 1 (5 rows × 3 cols) — SOURCES LIST: source | Hard copy (H)
  or electronic (E) | Used (U) or Not used (NU). 4 blank rows in the
  template; the generator writes one row per source.
- Table 2 (58 rows × 7 cols) — elements table. Row 0 is the header
  row (group columns read "Required for (Insert Column For each
  Defined Group of Participants)"). Row 1 is the sub-header row with
  the example group names ("Pay Status Retirees/ Beneficiaries",
  "Active/ Sep. Vested/ Non-Vested"). Rows 2–57 are the 56 elements:
  field | description | reason required | group 1 | group 2 |
  primary source | secondary source.
- The generator reproduces this structure exactly: 3 tables, same
  dimensions, same labels. Group columns come from
  `participantGroups` in the JSON (v0.1.0: the two template groups).

## Statuses

- `present` — required, source found.
- `conditional` — required only when the condition holds. The
  condition is stated in `condition` (e.g. "if a QDRO exists") and
  shown in the required-for cells as "If …". QDRO fields, spouse
  fields, and non-spouse beneficiary fields are the usual conditional
  ones.
- `notApplicable` — the plan has no such provision. Renders "N/A".
- `missing` — not found yet, never guessed. Renders "— missing —".
- `ambiguous` — two conflicting readings in one document. Renders
  the value plus "[AMBIGUOUS: …]".

## Provenance

The DEL's source columns (Primary / Secondary Source) are the
provenance for every field — same discipline as R5 citations. The
generator also writes the citation code (e.g. "D1 §2.1 p3") as a
second line under the primary source, so the reader can find the
concept in the document. The full document name lives once in the
sources list, never repeated in a cell.

## T001 / T002

Template codes, not BCV Data Dictionary fields (verified against the
2026-10-30 dictionary index: not found). They are allowed in the
schema and in the demo with a note saying so. They render as
"— missing —" with the note until a source for them is given.

## Match ranking

The ranking page compares the dictionary definition verbiage with
the matched plan-document verbiage. The score is deterministic and
offline: token overlap (Dice) + phrase overlap (shared bigrams) +
key-term bonus (field-name tokens), with a PBGC synonym lexicon.
The score is decomposable — the table shows which tokens matched.
The score ranks, never decides. Low-score and unmatched fields are
surfaced in their own filter, never dropped.
