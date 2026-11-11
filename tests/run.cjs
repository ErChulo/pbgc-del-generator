"use strict";
/* DEL Generator v0.1.0 — test runner.
   Loads the single <script> block of del-generator.html into a Node vm
   (no DOM, no localStorage, no navigator — the pure logic only) and
   checks schema validation, flexible import, partial merge, the
   deterministic scorer, the ranking, and the .docx bytes.
   Run: node tests/run.cjs   (exits non-zero on any failure) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "del-generator.html"), "utf-8");
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.error("FAIL: no <script> block in del-generator.html"); process.exit(1); }
const script = m[1];

const sandbox = {
  console,
  TextEncoder,
  Blob,
  URL,
  File,
  setTimeout,
};
vm.createContext(sandbox);
try {
  vm.runInContext(script, sandbox, { filename: "del-generator.html" });
} catch (e) {
  console.error("FAIL: script did not load:", e.message);
  process.exit(1);
}
const DEL = sandbox.DEL;
if (!DEL) { console.error("FAIL: globalThis.DEL not exported"); process.exit(1); }

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("FAIL  " + name + (extra ? " — " + extra : "")); }
}
function clone(o) { return JSON.parse(JSON.stringify(o)); }

console.log("DEL Generator v" + DEL.VERSION + " — tests");

/* --- 1. Schema + demo --- */
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, "schema", "del.schema.json"), "utf-8"));
check("schema is valid JSON with 4 top-level properties", Object.keys(schema.properties).length === 4);
check("DEL_FIELDS has 56 template elements", DEL.DEL_FIELDS.length === 56);
const demo = DEL.DEMO_DEL_JSON;
check("demo has 56 elements", demo.elements.length === 56);
const demoErrs = DEL.validateDelJson(demo);
check("demo validates", demoErrs.errors.length === 0, demoErrs.errors.join("; "));
check("demo plan is the synthetic Riverbend plan", demo.planMetadata.planName === "Riverbend Manufacturing Pension Plan");
check("demo case number is text 98765400", demo.planMetadata.caseNumber === "98765400");
check("demo DOPT is 2025-06-30", demo.planMetadata.dopt === "2025-06-30");
const amb = demo.elements.filter((e) => e.status === "ambiguous");
check("demo has exactly 1 ambiguous item (AP_PERCENT)", amb.length === 1 && amb[0].field === "AP_PERCENT");
const cond = demo.elements.filter((e) => e.status === "conditional");
check("demo has conditional items (QDRO/spouse)", cond.length >= 5, "found " + cond.length);
const miss = demo.elements.filter((e) => e.status === "missing");
check("demo has missing items (T001/T002)", miss.length === 2 && miss.some((e) => e.field === "T001"));

/* --- 1b. .docx filename: <case>DEL.docx --- */
check("docx filename is <case>DEL.docx", DEL.delDocxFileName("98765400") === "98765400DEL.docx");
check("docx filename keeps leading zeros (case number is text)", DEL.delDocxFileName("00123456") === "00123456DEL.docx");
check("docx filename falls back to DEL.docx when empty", DEL.delDocxFileName("") === "DEL.docx");
check("docx filename falls back to DEL.docx when null", DEL.delDocxFileName(null) === "DEL.docx");
check("docx filename falls back to DEL.docx when undefined", DEL.delDocxFileName(undefined) === "DEL.docx");

/* --- 2. Validator rejects bad input, accepts good --- */
const bad1 = clone(demo); delete bad1.planMetadata.planName;
check("validator rejects missing planName", DEL.validateDelJson(bad1).errors.length > 0);
const bad2 = clone(demo); bad2.planMetadata.dopt = "June 30, 2025";
check("validator rejects non-ISO dopt", DEL.validateDelJson(bad2).errors.length > 0);
const bad3 = clone(demo); bad3.elements[0].status = "maybe";
check("validator rejects bad status", DEL.validateDelJson(bad3).errors.length > 0);
const bad4 = clone(demo); bad4.elements[0].status = "conditional"; bad4.elements[0].condition = null;
check("validator rejects conditional without condition", DEL.validateDelJson(bad4).errors.length > 0);
const bad5 = clone(demo); bad5.elements[0].status = "present"; bad5.elements[0].primarySource = null;
check("validator rejects present without primarySource", DEL.validateDelJson(bad5).errors.length > 0);
const bad6 = clone(demo); bad6.elements.push(clone(bad6.elements[0]));
check("validator rejects a duplicate field", DEL.validateDelJson(bad6).errors.length > 0);
const ext = clone(demo);
ext.elements.push({ field: "DOBF", status: "present", description: "Date of Benefit Freeze", reasonRequired: "Benefit Calculation", requiredFor: {}, primarySource: "Plan document", secondarySource: null, condition: null, citation: { document: "Plan document", page: "4", section: "1.2", imageViewerDocumentNumber: null }, match: null, note: null, audit: [] });
check("validator accepts a field outside the template's 56 (extensible)", DEL.validateDelJson(ext).errors.length === 0, DEL.validateDelJson(ext).errors.join("; "));
const goodExtra = clone(demo);
goodExtra.elements.push({ field: "PA_AMB", status: "present", description: "x", reasonRequired: "x", requiredFor: {}, primarySource: "Census", secondarySource: null, condition: null, citation: { document: "Census", page: null, section: null, imageViewerDocumentNumber: null }, match: null, note: null, audit: [] });
check("validator rejects a duplicate even when the field is a real one", DEL.validateDelJson(goodExtra).errors.length > 0);

/* --- 3. Flexible import --- */
const flex1 = DEL.importFlexDelJson({
  "Plan Name": "Riverbend Manufacturing Pension Plan",
  "Case Number": "98765400",
  DOPT: "2025-06-30",
  RETSTAT: "Participant status at DOPT",
  "Participant Date of Birth": "January 15, 1960",
}, { sourceType: "JSON payload", sourceLabel: "test payload" });
check("flex import maps header + elements", flex1.errors.length === 0 && flex1.mapped.length >= 4, flex1.errors.join("; "));
check("flex import sets planName", flex1.data.planMetadata.planName === "Riverbend Manufacturing Pension Plan");
check("flex import normalises a written-out date", flex1.data.planMetadata.dopt === "2025-06-30");
const dobEl = flex1.data.elements.find((e) => e.field === "DOB");
check("flex import maps a qualified synonym (Participant Date of Birth -> DOB)", dobEl && dobEl.status === "present");
const flex2 = DEL.importFlexDelJson({ "SomeRandomKey": "x", "dateofbirth": "1960-01-15" }, {});
check("flex import lists unmapped keys, never drops them", flex2.unmapped.length === 2, "unmapped=" + flex2.unmapped.length);
const flex3 = DEL.importFlexDelJson({ "Plan Name": "A", planName: "B" }, {});
check("flex import reports a header conflict and keeps neither value", flex3.conflicts.length === 1 && flex3.data.planMetadata.planName === "");
const flex4 = DEL.importFlexDelJson({ RETSTAT: "Retired", retstat: "Separated Vested" }, {});
const retEl = flex4.data.elements.find((e) => e.field === "RETSTAT");
check("flex import marks a conflicting element ambiguous", flex4.conflicts.length === 1 && retEl && retEl.status === "ambiguous");
check("flex import passes DEL schema JSON through unchanged", DEL.importFlexDelJson(clone(demo), {}).kind === "del");
const ocr = DEL.importFlexDelJson({
  extraction: { RETSTAT: "present", DOB: "Participant's date of birth", planName: "Riverbend Manufacturing Pension Plan" },
  candidateSources: { "/DOB": [{ value: "Date of birth: January 15, 1960", spans: [] }] },
  fieldEvidence: { "/DOB": { quote: "Date of birth: January 15, 1960", location: "D1 §3.2 p12" } },
}, { sourceType: "OCR payload", sourceLabel: "OCR payload" });
const ocrDob = ocr.data.elements.find((e) => e.field === "DOB");
check("OCR payload maps extraction + evidence", ocr.errors.length === 0 && ocrDob && ocrDob.status === "present" && ocrDob.match && ocrDob.match.location === "D1 §3.2 p12", ocr.errors.join("; "));
check("OCR payload status word does not invent a passage", (() => {
  const r = ocr.data.elements.find((e) => e.field === "RETSTAT");
  return r && r.status === "present" && !r.match;
})());

/* --- 4. Partial merge --- */
const current = clone(demo);
current.elements.find((e) => e.field === "FNAME").status = "missing";
current.elements.find((e) => e.field === "DOB").status = "missing";
const partial = {
  planMetadata: { planName: "Some Other Plan" },
  elements: [
    { field: "FNAME", status: "present", primarySource: "Census", citation: { document: "Census", page: null, section: null, imageViewerDocumentNumber: null }, description: "Participant's First Name", reasonRequired: "Identification", requiredFor: {}, secondarySource: null, condition: null, match: null, note: null, audit: [] },
    { field: "DOB", status: "present", primarySource: "Census", citation: { document: "Census", page: null, section: null, imageViewerDocumentNumber: null }, description: "Participant's Date of Birth", reasonRequired: "Age Calculation", requiredFor: {}, secondarySource: null, condition: null, match: null, note: null, audit: [] },
    { field: "RETSTAT", status: "present", primarySource: "Census", citation: { document: "Census", page: null, section: null, imageViewerDocumentNumber: null }, description: "Participant Status at DOPT", reasonRequired: "Benefit Calculation", requiredFor: {}, secondarySource: null, condition: null, match: null, note: null, audit: [] },
    { field: "NOT_A_FIELD", status: "present", primarySource: "Census", citation: { document: "Census", page: null, section: null, imageViewerDocumentNumber: null } },
  ],
};
check("partial payload is detected as partial", DEL.delIsPartialDelJson(partial));
check("full demo JSON is NOT partial", !DEL.delIsPartialDelJson(demo));
const merged = DEL.mergePartialDelJson(current, partial);
check("partial merge succeeds", merged.ok, merged.errors.join("; "));
check("partial merge fills only missing slots", merged.filled.length === 2 && merged.filled.some((f) => f.field === "FNAME") && merged.filled.some((f) => f.field === "DOB"));
check("partial merge never overwrites an existing value", merged.ignored.length === 1 && merged.ignored[0].field === "RETSTAT");
check("partial merge reports the unknown field", merged.report.join(" ").includes("NOT_A_FIELD"));
check("partial merge ignores the header key", merged.report.join(" ").includes("planMetadata"));
check("partial merge leaves the plan name untouched", merged.data.planMetadata.planName === "Riverbend Manufacturing Pension Plan");
const badPartial = { elements: [{ field: "FNAME", status: "present" }] };
const refused = DEL.mergePartialDelJson(current, badPartial);
check("partial merge refuses an element without primarySource/citation", !refused.ok && refused.errors.length > 0);

/* --- 5. Deterministic scorer --- */
const sIdentical = DEL.delScore("Participant status at DOPT", "Participant status at the Date of Plan Termination is Retired, Separated Vested, Active Vested, or Nonvested.");
check("scorer: near-identical texts score high", sIdentical.score >= 50, "score=" + sIdentical.score);
const sUnrelated = DEL.delScore("Participant status at DOPT", "The trustee shall invest the plan assets in diversified funds.");
check("scorer: unrelated texts score low", sUnrelated.score < 30, "score=" + sUnrelated.score);
const sSame = DEL.delScore("Age 65", "Age 65");
const sDiffAge = DEL.delScore("Age 65", "Age 62");
check("scorer: numbers matter (65 vs 62 scores below 65 vs 65)", sDiffAge.score < sSame.score, sDiffAge.score + " vs " + sSame.score);
check("scorer: matched tokens are returned", sIdentical.matched.length > 0 && sIdentical.matched.includes("participant"));
const res = DEL.delRankElements(demo.elements);
const ranked = res.ranked, unmatched = res.unmatched;
check("ranking returns all 56 elements (ranked + unmatched)", ranked.length + unmatched.length === 56, ranked.length + " + " + unmatched.length);
let sorted = true;
for (let i = 1; i < ranked.length; i++) if (ranked[i].score > ranked[i - 1].score) sorted = false;
check("ranking is sorted descending", sorted);
const presentWithPassage = demo.elements.filter((e) => e.status === "present" && e.match && e.match.passage);
const lowScores = presentWithPassage.filter((e) => {
  const r = ranked.find((x) => x.element.field === e.field);
  return !r || r.score < 30;
});
check("ranking: every present element scores >= 30 against its best passage", lowScores.length === 0, lowScores.map((e) => e.field).join(", "));
const allScores = ranked.map((r) => r.score).sort((a, b) => a - b);
const median = allScores[Math.floor(allScores.length / 2)];
check("ranking: median score is >= 80", median >= 80, "median=" + median);
const ownPassageBest = presentWithPassage.filter((e) => {
  const r = ranked.find((x) => x.element.field === e.field);
  return r && r.passage && r.passage.text === e.match.passage;
});
check("ranking: most present elements' best match is their own passage (>= 80%)", ownPassageBest.length >= Math.ceil(presentWithPassage.length * 0.8), ownPassageBest.length + " of " + presentWithPassage.length);
check("ranking: the 2 missing elements are unmatched, not dropped", unmatched.length === 2 && unmatched.some((e) => e.field === "T001") && unmatched.some((e) => e.field === "T002"), unmatched.map((e) => e.field).join(", "));

/* --- 6. .docx bytes --- */
const bytes = DEL.delBuildDocxBytes(demo);
check("docx bytes are a stored ZIP (PK header)", bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04);
const buf = Buffer.from(bytes);
function has(str) { return buf.indexOf(Buffer.from(str, "utf8")) >= 0; }
check("docx contains the plan name", has("Riverbend Manufacturing Pension Plan"));
check("docx contains the case number", has("98765400"));
check("docx contains the DOPT", has("2025-06-30"));
check("docx contains the plan number cell", has("Plan No. 001"));
check("docx contains the elements table title", has("Data Elements and Sources List"));
check("docx contains a field name (RETSTAT)", has("RETSTAT"));
check("docx contains a QDRO field", has("QDRO_INDICATOR"));
check("docx contains the conditional wording", has("If a QDRO exists"));
check("docx contains the ambiguous marker", has("[AMBIGUOUS:"));
check("docx contains the citation code", has("D1"));
const xml = DEL.delBuildDocumentXml(demo);
check("document XML has 3 tables", (xml.match(/<w:tbl>/g) || []).length === 3);
check("document XML has 58 element-table rows (2 header + 56)", (() => {
  const tables = xml.split("<w:tbl>");
  const elTable = tables[3] || "";
  return (elTable.match(/<w:tr>/g) || []).length === 58;
})());

/* --- 7. Prompt embedded --- */
check("prompt is embedded in the app", typeof DEL.DEL_SCRAPER_PROMPT === "string" && DEL.DEL_SCRAPER_PROMPT.length > 5000, "len=" + DEL.DEL_SCRAPER_PROMPT.length);
const promptMissing = DEL.DEL_FIELDS.filter(([f]) => !DEL.DEL_SCRAPER_PROMPT.includes(f));
check("prompt names all 56 fields", promptMissing.length === 0, promptMissing.map(([f]) => f).join(", "));
check("prompt says return only valid JSON", /return \*\*only\*\* valid JSON/i.test(DEL.DEL_SCRAPER_PROMPT));
check("prompt says do not guess", /do not guess/i.test(DEL.DEL_SCRAPER_PROMPT));


/* --- 8. UI import/generate path (minimal DOM stub) ---
   The pure logic is tested above. This block loads the same script with
   a stub document so the thin UI dispatch (delImportText, delGenerate)
   runs too — the part a browser user actually touches. */
{
  const docStub = {
    readyState: "complete",
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ click: () => {}, setAttribute: () => {} }),
    body: { appendChild: () => {} },
  };
  const sb2 = { console, TextEncoder, Blob, URL, File, setTimeout, document: docStub };
  vm.createContext(sb2);
  vm.runInContext(script, sb2, { filename: "del-generator.html" });
  const D2 = sb2.DEL;
  const st = () => sb2.DEL.state;

  sb2.delImportText(JSON.stringify(D2.DEMO_DEL_JSON), "test file");
  check("UI import accepts a good full DEL JSON", st().data !== null && st().importReport.kind === "del" && st().step === 2);

  sb2.delImportText('{"planMetadata": ', "bad file");
  check("UI import rejects unreadable JSON", st().importReport.kind === "error");

  const badFull = clone(D2.DEMO_DEL_JSON); delete badFull.planMetadata.planName;
  sb2.delImportText(JSON.stringify(badFull), "bad file");
  check("UI import rejects a full DEL JSON that fails validation", st().importReport.kind === "error", JSON.stringify(st().importReport.report));

  // Partial merge through the UI path.
  sb2.delImportText(JSON.stringify(D2.DEMO_DEL_JSON), "test file");
  const cur = st().data;
  cur.elements.find((e) => e.field === "FNAME").status = "missing";
  const part = { elements: [{ field: "FNAME", status: "present", primarySource: "Census", citation: { document: "Census", page: null, section: null, imageViewerDocumentNumber: null }, description: "Participant's First Name", reasonRequired: "Identification", requiredFor: {}, secondarySource: null, condition: null, match: null, note: null, audit: [] }] };
  sb2.delImportText(JSON.stringify(part), "partial file");
  check("UI partial import fills the missing slot", st().importReport.kind === "partial" && st().importReport.filled === 1 && st().data.elements.find((e) => e.field === "FNAME").status === "present");

  // Generate gate: locked while undecided, open once all decided.
  sb2.delGenerate();
  check("UI generate is locked while fields are undecided", st().generated === null);
  st().data.elements.forEach((el) => { if (el.status !== "notApplicable") st().decisions[el.field] = "approved"; });
  sb2.delGenerate();
  check("UI generate produces the .docx once all decided", !!st().generated && st().generated.name === "98765400DEL.docx" && st().step === 4, "name=" + (st().generated && st().generated.name));
}

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
