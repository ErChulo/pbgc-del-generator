# OPEN ITEMS — DEL Generator v0.1.0

The canonical gap list. Read this before proposing next steps.

## 1. Prompt must grow to the full Input universe (biggest gap)

v0.1.0's prompt lists the template's 56 fields. The DEL universe is all
Input fields (220 Input + 51 Input|Calculated). The prompt must grow in
grouped per-field-group prompts, like the R5 missing-items pattern: one
prompt per field group (identification, service, QDRO, ARD, …), not one
giant prompt. The schema already accepts any Input field; the app does
not yet load the full dictionary.

## 2. Full-universe dictionary loading is not in the HTML

Only the 56 template elements are embedded. Loading the full dictionary
(1,152 fields) into the single file — or loading it from a user-picked
file — is undecided. Do not embed the full dictionary until the loading
path is decided.

## 3. APLNAME dictionary data error

The dictionary's DESCRIPTION cell for `APLNAME` is literally "form_co".
That is a data error in the dictionary, not in the app. The DEL
template's words ("Alternate Payee's Last Name") are used instead.
Record it; do not "fix" the dictionary unilaterally.

## 4. More than 2 participant groups = a very wide table

The elements table grows one column per participant group. With many
groups the .docx gets very wide. No pagination or wrapping decision has
been made. The template's example has 2 groups; v0.1.0 handles 2.

## 5. Citation line under the primary source — user decision needed

The generated .docx puts the citation code (e.g. "D1 §2.1 p3") as a
second line under the primary source. Whether that line belongs in the
finished DEL is a user decision to confirm later. (The R5 generator
does the same for values; the DEL template has no such line.)

## 6. Not opened in a real browser

Verified by `node --check`, a Node vm harness, and python-docx only.
The stepper, review buttons, file picker, and Share button have not
been clicked anywhere. The office end-to-end test is still to come.

## 7. Not run against a real LLM

Prompt and import tested with simulated payloads only. The first real
Copilot/LLM payload will show what the prompt gets wrong.

## 8. Scorer is lexical only, and 5 of 54 demo passages are not the best match

The deterministic scorer (token overlap + phrase overlap + key-term
bonus) finds the element's own passage as the best match for 49 of the
54 demo passages. The other 5 are short definitions ("Participant Sex",
"Marital Status") whose own passage scores below another field's
passage. The ranking view flags those with "Best match differs from the
proposed passage — check it." True semantic embeddings (transformers.js)
are a later prototype, not in v0.1.0. Embeddings are nearly blind to
numbers/dates/ages, so the lexical score must stay in the combined
score whenever embeddings arrive.

## 9. First real OCR payload still needs manual mapping

The flex import handles the OCR-payload envelope (extraction +
candidateSources + fieldEvidence), but the OCR app's real schema has
never been seen. The first real payload will need a round of manual
mapping in Review, by design. Applied mappings persist in localStorage.

## 10. Design system v1.1.0 is DRAFT, not approved

Tokens are v1.1.0 DRAFT for COLA / Section 508 review, not approved.
No component exists for a match-ranking table row or a review
approve/edit/reject control — suggestion to the design-system team,
recorded in `docs/DESIGN_SYSTEM.md`. Do not change the design-system
repo unilaterally.

## 11. Sources table grows with the source count

The template has 5 rows (1 header + 4 blank). The app writes 1 header
row + one row per source, padded to at least 5. With 5 sources the
demo .docx has 6 rows. That is correct — the blank rows are
placeholders, not a limit — but it is a deliberate deviation from the
template's row count.

## 12. T001 / T002 are template codes, not dictionary fields

They are allowed in the schema with a note saying so. The validator
only warns. The prompt must keep telling the LLM that.

## 13. Bare ambiguous words do not map, by design

"vesting", "disability", "lumpsum", "dateofbirth", "ssn",
"beneficiaryssn", "accruedmonthlybenefit", "benefitform" and similar
bare words are deliberately NOT in the synonym table — each could be
several fields. They appear as unmapped keys in Review, with a
per-key target dropdown. Do not add a bare word without checking it
cannot be two fields.

## 14. No rates, no BCV dependency

The DEL has no rates. Nothing in this app calls or needs the BCV
add-in. Do not add one.

## 15. The demo's missing items are deliberate

T001 and T002 are "missing" in the demo (template codes with no
dictionary definition to match). AP_PERCENT is deliberately ambiguous
(two readings: §9.2 "50% x marital fraction" vs the QDRO appendix).
Do not "fix" the demo by inventing values.
