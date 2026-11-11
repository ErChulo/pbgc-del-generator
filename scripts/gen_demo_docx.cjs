"use strict";
/* Generate the demo DEL.docx through the HTML's own code.
   Usage: node scripts/gen_demo_docx.cjs [output-path] */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const out = process.argv[2] || "/tmp/del-demo.docx";
const html = fs.readFileSync(path.join(ROOT, "del-generator.html"), "utf-8");
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.error("no <script> block"); process.exit(1); }
const sandbox = { console, TextEncoder, Blob, URL, File, setTimeout };
vm.createContext(sandbox);
vm.runInContext(m[1], sandbox, { filename: "del-generator.html" });
const bytes = sandbox.DEL.delBuildDocxBytes(sandbox.DEL.DEMO_DEL_JSON);
fs.writeFileSync(out, Buffer.from(bytes));
console.log("wrote " + out + " (" + bytes.length + " bytes)");
