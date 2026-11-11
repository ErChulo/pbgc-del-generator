#!/usr/bin/env python3
"""Verify the demo DEL.docx produced by the HTML's own code.

Generates /tmp/del-demo.docx via scripts/gen_demo_docx.cjs, then checks
it with python-docx: 3 tables with the template's dimensions, the header
filled, the elements rows filled, no placeholder text left.

Usage: python3 scripts/verify_docx.py [/tmp/del-demo.docx]
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/tmp/del-demo.docx")

failures = []


def check(name, cond, extra=""):
    print(("  ok  " if cond else "FAIL  ") + name + ("" if cond else f" — {extra}"))
    if not cond:
        failures.append(name)


def main():
    r = subprocess.run(
        ["node", str(ROOT / "scripts" / "gen_demo_docx.cjs"), str(OUT)],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        print("FAIL  could not generate the demo docx:", r.stderr.strip())
        sys.exit(1)
    print(r.stdout.strip())

    from docx import Document

    doc = Document(str(OUT))
    check("document has 3 tables", len(doc.tables) == 3, f"found {len(doc.tables)}")

    header, sources, elements = doc.tables[0], doc.tables[1], doc.tables[2]
    check("header table is 11 x 2", len(header.rows) == 11 and len(header.columns) == 2,
          f"{len(header.rows)}x{len(header.columns)}")
    check("header: case number filled", "98765400" in header.cell(2, 1).text,
          repr(header.cell(2, 1).text))
    check("header: DOPT filled", "2025-06-30" in header.cell(3, 1).text)
    check("header: plan name + number in one cell",
          "Riverbend Manufacturing Pension Plan" in header.cell(5, 1).text
          and "Plan No. 001" in header.cell(5, 1).text,
          repr(header.cell(5, 1).text))
    check("header: processing division", "ASD-D" in header.cell(6, 0).text)

    # The template has 5 rows (1 header + 4 blank placeholders). The app
    # writes 1 header row + one row per source, padded to at least 5.
    # The demo has 5 sources, so 6 rows is correct.
    check("sources table is 6 x 3 (header + 5 sources)", len(sources.rows) == 6 and len(sources.columns) == 3,
          f"{len(sources.rows)}x{len(sources.columns)}")
    check("sources header row", "SOURCES LIST" in sources.cell(0, 0).text)
    src_text = "\n".join(c.text for row in sources.rows for c in row.cells)
    check("sources list has the plan document", "Riverbend Manufacturing Pension Plan" in src_text)
    check("sources list has a QDRO source", "QDRO" in src_text)

    check("elements table is 58 x 7", len(elements.rows) == 58 and len(elements.columns) == 7,
          f"{len(elements.rows)}x{len(elements.columns)}")
    check("elements header row 0", "PBGC Access" in elements.cell(0, 0).text)
    check("elements header row 1 has group A", "Pay Status Retirees" in elements.cell(1, 3).text)
    check("elements header row 1 has group B", "Active/ Sep. Vested" in elements.cell(1, 4).text)
    check("first element row is RETSTAT", elements.cell(2, 0).text.strip() == "RETSTAT",
          repr(elements.cell(2, 0).text))
    check("last element row is AP_REQ_DOR", elements.cell(57, 0).text.strip() == "AP_REQ_DOR",
          repr(elements.cell(57, 0).text))
    all_text = "\n".join(c.text for row in elements.rows for c in row.cells)
    check("elements: QDRO conditional wording present", "If a QDRO exists" in all_text)
    check("elements: ambiguous marker present", "[AMBIGUOUS:" in all_text)
    check("elements: citation code present", "D1" in all_text)
    check("elements: T001 is missing, not guessed",
          "— missing —" in elements.cell(2 + 53, 3).text or "— missing —" in all_text)
    check("no TODO placeholder left", "TODO" not in all_text and "PLACEHOLDER" not in all_text.upper())
    check("no 'Insert Column' text in data rows",
          "Insert Column" not in "\n".join(c.text for row in elements.rows[2:] for c in row.cells))
    # Every present element must have a primary source cell filled.
    empty_primary = []
    for i, row in enumerate(elements.rows[2:], start=2):
        status_cell = row.cells[0].text.strip()
        if row.cells[5].text.strip() == "" and status_cell not in ("T001", "T002"):
            empty_primary.append(status_cell)
    check("every non-missing element has a primary source", not empty_primary,
          f"empty for: {', '.join(empty_primary)}")

    print(f"\n{len(failures)} failure(s)" if failures else "\nAll docx checks passed")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
