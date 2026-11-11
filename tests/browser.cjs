// Browser test: loads del-generator.html in jsdom with an opaque origin
// (a file: URL) and clicks "Try the demo".
// Regression test for the v0.1.0 bug: the script touched localStorage at the
// top level, and on an opaque origin that access throws, killing the whole
// script — no DEL global, no click handler, nothing worked. Every storage
// access must go through delSafeStorage(); this test proves the app survives
// a blocked localStorage and the demo button works.
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let failures = 0;
function check(name, ok, extra) {
  console.log((ok ? '  ok  ' : 'FAIL  ') + name + (extra !== undefined ? ' — ' + extra : ''));
  if (!ok) failures++;
}

const html = fs.readFileSync(path.join(__dirname, '..', 'del-generator.html'), 'utf8');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push(String(e && e.message || e)));
vc.on('error', (...a) => errors.push(a.join(' ')));

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'file:///del-generator.html',
  virtualConsole: vc,
  pretendToBeVisual: true
});
const { window } = dom;
const { document } = window;

setTimeout(() => {
  try {
    check('script survives evaluation on an opaque origin (no jsdom errors)', errors.length === 0, errors.join(' | '));
    check('DEL global exists', !!window.DEL);
    check('stepper rendered on load', document.getElementById('stepper').children.length === 5);
    const btn = document.querySelector('[data-action="demo"]');
    check('demo button found', !!btn);
    btn.click();
    check('demo loads data', !!window.DEL.state.data);
    check('demo moves to Review (step 2)', window.DEL.state.step === 2);
    check('review box populated', document.getElementById('review-box').innerHTML.length > 500);
    check('step-2 section visible', document.getElementById('step-2').style.display === '');
    check('saved mappings fall back to empty when storage is blocked', JSON.stringify(window.DEL.state.savedMappings) === '{}');
  } catch (e) {
    check('no exception during browser test', false, e.message);
  }
  console.log(failures === 0 ? '\nBrowser tests passed' : '\nBrowser tests FAILED: ' + failures);
  process.exit(failures === 0 ? 0 : 1);
}, 200);
