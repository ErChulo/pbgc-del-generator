# How the DEL Generator works

ASD STE 100. One idea per line. User action, then app behavior.

## Open

- Open `del-generator.html`. No server. No install.
- The menu has four pages: DEL generator, Match ranking, Welcome, Help.
- The landing page shows only the work steps.

## 1. Download the prompt

- You: click "Download the scraper prompt".
- App: downloads `del-scraper-prompt.md`.

## 2. Scrape (outside the app)

- You: feed the prompt and the plan documents to an LLM. Copilot in the office, any LLM at home.
- LLM: returns JSON. It only proposes.

## 3. Upload the JSON

- You: upload or paste the JSON.
- App: validates it against the schema. Bad JSON is refused.
- App: fills only empty slots. It never overwrites a value.
- App: lists keys it does not know. You assign each one a target.

## 4. Review

- You: approve, reject, or edit each field.
- App: shows missing, ambiguous, and conditional fields. Nothing is hidden.
- App: blocks Generate until every field is decided.

## 5. Generate

- You: click "Generate the DEL.docx".
- App: writes the Word document from the template (3 tables). Plan name and case number go in the header table.
- App: no LLM in this step. The document comes only from approved JSON.

## 6. Download

- You: click "Download the DEL.docx".
- App: downloads `<case>DEL.docx`. Example: `98765400DEL.docx`.
- App: writes an audit log of every action. You can download it.

## Match ranking

- Open it from the menu.
- App: ranks every field by similarity score, highest first.
- App: the score compares the dictionary definition with the matched plan verbiage.
- You: the score ranks. You decide.

## Welcome and Help

- Welcome: what the app does, in 5 steps. "Try the demo" loads the Riverbend demo and opens the DEL view.
- Help: what a DEL is, what the LLM does, what to do if it is wrong, glossary.

## Rules the app never breaks

- Nothing leaves this page. No server. No fetch.
- The LLM proposes. The app checks. You decide.
- No full masked values. No participant data in the DEL.
