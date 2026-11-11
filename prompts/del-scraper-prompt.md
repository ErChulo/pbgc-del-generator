# DEL — Data Element Listing Scraper Prompt

Use this prompt with an LLM of your choice. Attach the plan documents
**and** the other associated documents — plan document, amendments,
restatements, SPD, trust agreement, QDROs, TWG memo, trusteeship
agreement, prior administrator data, anything about the plan — together
with this prompt. The LLM must return **only** the JSON payload
described below. That JSON is a *proposal*: it is fed back into the DEL
Generator app, validated against `schema/del.schema.json`, reviewed by
a human, and only approved JSON is used to write the DEL Word document.
The LLM never fills the Word document and never decides an ambiguous
field on its own.

## Your task

You are listing the data elements a PBGC case needs for a terminated
defined-benefit pension plan. For each of the 56 data elements below,
find whether the plan's provisions make that field necessary, for
which participant groups, and where in the documents the concept
appears. Return the answers as JSON matching the schema in
`schema/del.schema.json` (also summarised in "Output format" below).

**You are NOT extracting participant data.** Do not return any
participant's values, names, SSNs, or dates. You are listing which
fields the plan needs and where each one comes from: the field, why it
is required, which participant groups need it, the primary and
secondary source, and the citation (document, section, page) where the
concept appears. A field's `description` is the dictionary definition;
your `match.passage` is the short plan-document verbiage that means
the same thing.

## Rules

- **Summarise, do not copy verbatim — ASD STE 100 minimal style.**
  Every matched passage must be the **smallest string that conveys
  the meaning**: a noun phrase or short clause, never a full sentence,
  one idea per passage. Keep ages, service years, percentages, dollar
  amounts, and dates **exact**. Standard abbreviations: `yr`/`yrs`,
  `mo`, `hrs`, `%`, `§`, `excl.`, `equiv.`, `avg comp`, `svc`
  (service). If stripping verbiage would lose meaning (a condition,
  an exception, a date), keep the longer form and say why in `note`.
  A longer value that is still true beats a minimal value that is
  wrong.
- **One entry per field.** Every one of the 56 fields below must be
  present in `elements`. Do not omit a field.
- **Status.** For each field set `status`:
  - `present` — the plan's provisions make this field necessary, and
    you found where the concept appears. Give the citation and the
    matched passage.
  - `conditional` — the field is necessary only when a condition
    holds. State the condition in `condition`, e.g. "if a QDRO
    exists", "if married at DOPT", "if a non-spouse beneficiary is
    named". QDRO fields are conditional on a QDRO existing. Spouse
    fields are conditional on the participant being married at DOPT.
    Non-spouse beneficiary fields are conditional on a non-spouse
    beneficiary being named.
  - `notApplicable` — the plan has no such provision. Do not omit the
    field, and do not invent a provision. Example: no QDRO in the
    case → QDRO fields are `notApplicable`, not `missing`.
  - `missing` — you could not find the concept in the documents at
    all. Set `primarySource` and `secondarySource` to `null`.
  - `ambiguous` — two conflicting readings in the same document.
    Give your best reading and explain the conflict in `note`.
    Ambiguous fields are clarified in the R1 Interpretations of Note
    section; you do not resolve them.
- **Citation for every present or conditional field**: document name,
  page number, and plan section number in the JSON `citation`
  object. No citation, no present answer. The app renders it as a
  minimal code, e.g. `D1 §2.1 p3` (D1 = first document, § = plan
  section, p = page) — the full document name lives once in the
  sources list, never repeated in a cell.
- **Required for.** For each field, set `requiredFor` with one key
  per participant group (`"Pay Status Retirees/ Beneficiaries"` and
  `"Active/ Sep. Vested/ Non-Vested"`), `true` when the field is
  required for that group, `false` when it is not.
- **Sources.** `primarySource` is where the field comes from first:
  "Census" for participant identity fields the census carries,
  "Plan document" for fields the plan's provisions create,
  "Prior administrator data" for the prior administrator's amounts
  (PA_AMB, CSPA, VPPA, VSPA), "QDRO" for alternate payee fields.
  `secondarySource` is the second source, or `null`.
- **Dates are ISO format `YYYY-MM-DD`. Case number is text, with
  leading zeros preserved (never a number).**
- **Do not guess.** A missing, ambiguous, or notApplicable answer is
  a correct answer. A guessed value is an error.
- **Never return a full masked value** (no full SSN, no full account
  number). The DEL lists fields and sources, not values.

## The 56 data elements (field name in brackets)

1) Participant Status at DOPT: 1 Retired, 2 Separated Vested, 3 Active Vested, 4 Nonvested [RETSTAT]
2) Type of Record: 1 Participant, 2 Beneficiary, 4 Alternate Payee [ID]
3) Participant's Social Security Number [SSN]
4) Participant's Date of Birth [DOB]
5) Participant's First Name [FNAME]
6) Participant's Middle Name [MNAME]
7) Participant's Last Name [LNAME]
8) Date of Death [DOD]
9) Participant's Gender [PSEX]
10) Spouse's Social Security Number [SSSN]
11) Spouse's Date of Birth [SDOB]
12) Spouse's First Name [SFNAME]
13) Spouse's Middle Name [SMNAME]
14) Spouse's Last Name [SLNAME]
15) Spouse's Extra Name (JR, SR, I, II, III) [SENAME]
16) Spouse/Beneficiary's Gender [SSEX]
17) Spouse's Date of Death [SDOD]
18) Non-Spouse Joint Life Beneficiary Indicator (Y=Yes, N=No) [NON_SPOUSE_BENF]
19) Non-Spouse Beneficiary's Social Security Number [BSSN]
20) Non-Spouse Beneficiary's Last Name [BLNAME]
21) Non-Spouse Beneficiary's First Name [BFNAME]
22) Non-Spouse Beneficiary's Gender [BSEX]
23) Non-Spouse Beneficiary's Date of Birth [BDOB]
24) Non-Spouse Beneficiary's Date of Death [BDOD]
25) QDRO Indicator (Y=Yes, N=No) [QDRO_INDICATOR]
26) Alternate Payee's Social Security Number [APSSN]
27) Alternate Payee's Last Name [APLNAME]
28) Alternate Payee's First Name [APFNAME]
29) Alternate Payee's Gender [APSEX]
30) Alternate Payee's Date of Birth [APDOB]
31) Alternate Payee's Date of Death [APDOD]
32) Participant's Marital Status at DOPT: M Married, S Single, W Widowed, D Divorced, U Unknown [MSTAT]
33) Participant's Date of Hire [DOH]
34) Date of Termination of Employment [DOTE]
35) Prior Administrator's Accrued Monthly Benefit [PA_AMB]
36) Participant's Actual Retirement Date [DOR]
37) Spouse/Beneficiary's Benefit Commencement Date [SBCD]
38) ARD Benefit Form [FORM_CODE_ARD]
39) Spouse/Beneficiary's Percent of Benefit Form [SPC_ARD]
40) Months Certain in ARD Benefit Form [MTHS_ARD]
41) Level Life ARD Benefit in Pay Status [LEV_MB_ARD]
42) Date of Participation [DOP]
43) Prior Administrator's Credited Service [CSPA]
44) Prior Administrator's Vesting Percentage [VPPA]
45) Prior Administrator's Vesting Service [VSPA]
46) Health Status (0 Healthy, 1 Disabled w/o Social Security, 2 Disabled w/ Social Security) [PHS]
47) QDRO Type (SH Shared, SI Separate Interest) [QDRO_TYPE]
48) QDRO Fixed Dollar Amount to Alternate Payee [AP_FIXED_AMT]
49) QDRO Percentage to Alternate Payee [AP_PERCENT]
50) Accrued Monthly Benefit at QDRO Split Date [AMB_SPLIT_DATE]
51) Early Retirement Subsidy Indicator for Alternate Payee (Y=Yes, N=No) [ER_SUBSIDY_IND]
52) QDRO Accrued Benefit Split Date [QDRO_SPLIT_DATE]
53) QDRO Final Provision Date [QDRO_PROV_DATE]
54) Is alternate payee surviving spouse for QPSA [T001]
55) Is alternate payee surviving spouse for QJSA [T002]
56) Alternate Payee ARD Required by QDRO [AP_REQ_DOR]

Notes: T001 and T002 are template codes, not BCV Data Dictionary
fields. Answer them like the other fields, and say so in `note` if
the plan has no such provision. The full DEL universe is all Input
fields from the dictionary (220 Input + 51 Input|Calculated); this
prompt covers the template's 56. Later prompts will cover the rest,
one field group at a time.

## Output format

Return **only** valid JSON, no markdown fences, no commentary, no
explanation. The JSON must have exactly these top-level keys:

```json
{
  "planMetadata": {
    "einPn": "string or null",
    "caseNumber": "string (text, leading zeros preserved)",
    "dopt": "YYYY-MM-DD",
    "dotr": "YYYY-MM-DD or null",
    "planName": "string",
    "planNumber": "string or null",
    "processingDivision": "ASD-D",
    "preparedBy": "string or null",
    "datePrepared": "YYYY-MM-DD or null",
    "sourceDocuments": ["string"],
    "reviewedBy": "string or null",
    "dateReviewed": "YYYY-MM-DD or null",
    "narrative": "string or null"
  },
  "sources": [
    { "name": "string", "format": "H | E | null", "used": "U | NU | null" }
  ],
  "participantGroups": ["Pay Status Retirees/ Beneficiaries", "Active/ Sep. Vested/ Non-Vested"],
  "elements": [
    {
      "field": "RETSTAT",
      "description": "Participant Status at DOPT",
      "reasonRequired": "Benefit Calculation",
      "requiredFor": { "Pay Status Retirees/ Beneficiaries": true, "Active/ Sep. Vested/ Non-Vested": true },
      "primarySource": "Census",
      "secondarySource": "Plan document",
      "status": "present | conditional | notApplicable | missing | ambiguous",
      "condition": "string or null (for conditional: the condition, e.g. \"if a QDRO exists\")",
      "citation": { "document": "string", "page": "string or number or null", "section": "string or null", "imageViewerDocumentNumber": "string or null" },
      "match": { "concept": "string (name as it appears in the plan document)", "passage": "string (short plan-document verbiage, STE 100 minimal)", "location": "string, e.g. \"D1 §2.1 p3\"" },
      "note": "string or null",
      "audit": ["minimal location code, e.g. \"D1 §2.1 p3\""]
    }
  ]
}
```

Every one of the 56 fields must be present in `elements`. `sources`
lists every document you used, with format H (hard copy) or E
(electronic) and whether it was used (U) or not (NU).
`participantGroups` lists the Defined Groups of Participants, one
column per group in the DEL table.

## Workflow reminder (for the human, not the LLM)

1. Download this prompt from the DEL Generator app.
2. Feed the plan documents and associated documents + this prompt to
   your LLM (Microsoft Copilot in the office, any LLM at home).
3. Take the JSON the LLM returns and upload / paste it back into the
   DEL Generator app.
4. The app validates the JSON against the schema, flags missing /
   ambiguous / uncited items, and you review and approve each one.
5. Only approved JSON writes the filled DEL Word document. The app
   also ranks every field by similarity score on the Match ranking
   page, so you can check the weakest matches first.
