// Browser test: loads del-generator.html in jsdom and drives it like a user.
// Part 1 — opaque origin (a file: URL): the v0.1.0 localStorage bug. Every
// storage access must go through delSafeStorage(); this proves the app
// survives a blocked localStorage and the demo button works.
// Part 2 — theme toggle + logos: the toggle flips data-theme on the root,
// the dark page background is #000, the header stays brand blue, and the
// two embedded PBGC logos switch with the theme.
// Part 3 — persistence (http:// origin, storage works): a saved dark choice
// loads dark; toggling writes the choice back.
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
const ALT = 'Pension Benefit Guaranty Corporation';

function makeDom(url, beforeParse) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(String(e && e.message || e)));
  vc.on('error', (...a) => errors.push(a.join(' ')));
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url,
    virtualConsole: vc,
    pretendToBeVisual: true,
    beforeParse
  });
  return { dom, errors };
}

// ---- Parts 1 + 2: opaque origin (file: URL, localStorage throws) ----
const opaque = makeDom('file:///del-generator.html');

// ---- Part 3: storage works (http: origin), seeded dark ----
const stored = makeDom('http://localhost/', (window) => {
  window.localStorage.setItem('del-theme', 'dark');
});

// jsdom 27 does not resolve var() in computed background-color (it returns
// transparent), so background colors are checked on the CSS rules
// themselves, not on computed style. The toggle checks above prove the
// data-theme attribute flips; these prove the rules it flips between.
function cssRule(document, selector) {
  for (const sheet of document.styleSheets) {
    for (const r of sheet.cssRules) {
      if (r.selectorText === selector) return r;
    }
  }
  return null;
}
function cssVar(document, selector, name) {
  const r = cssRule(document, selector);
  return r ? r.style.getPropertyValue(name).trim() : null;
}

// PNG intrinsic size from a data URI (IHDR width/height, bytes 16-23).
function pngSize(src) {
  const b = Buffer.from(src.split(',')[1], 'base64');
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

function done() {
  console.log(failures === 0 ? '\nBrowser tests passed' : '\nBrowser tests FAILED: ' + failures);
  process.exit(failures === 0 ? 0 : 1);
}

setTimeout(() => {
  try {
    const { window } = opaque.dom;
    const { document } = window;
    check('script survives evaluation on an opaque origin (no jsdom errors)', opaque.errors.length === 0, opaque.errors.join(' | '));
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

    // ---- theme toggle (opaque origin: no persistence, no crash) ----
    const toggle = document.getElementById('theme-toggle');
    check('theme toggle button exists in the header', !!toggle);
    check('toggle has an accessible label', toggle && toggle.getAttribute('aria-label') === 'Switch to dark theme');
    check('starts in light theme', document.documentElement.getAttribute('data-theme') === null && window.DEL.state.theme === 'light');
    check('light page background is white (CSS --bg #FFFFFF)', cssVar(document, ':root', '--bg') === '#FFFFFF', cssVar(document, ':root', '--bg'));
    check('body background uses --bg', (cssRule(document, 'body') || { style: { background: '' } }).style.background === 'var(--bg)');
    toggle.click();
    check('toggle sets data-theme="dark"', document.documentElement.getAttribute('data-theme') === 'dark');
    check('dark page background is #000 (CSS rule)', (cssRule(document, ':root[data-theme="dark"] body') || { style: { background: '' } }).style.background === 'rgb(0, 0, 0)');
    check('dark theme sets --bg to #000000', cssVar(document, ':root[data-theme="dark"]', '--bg') === '#000000', cssVar(document, ':root[data-theme="dark"]', '--bg'));
    check('toggle label switches to Light', toggle.textContent.indexOf('Light') !== -1);
    check('toggle reports pressed in dark', toggle.getAttribute('aria-pressed') === 'true');
    check('topbar stays brand blue in dark (CSS var --blue #002D72)', cssVar(document, ':root', '--blue') === '#002D72' && (cssRule(document, '.topbar') || { style: { background: '' } }).style.background === 'var(--blue)');
    toggle.click();
    check('toggle back returns to light', document.documentElement.getAttribute('data-theme') === null && window.DEL.state.theme === 'light');

    // ---- logos (opaque origin) ----
    const logos = Array.from(document.querySelectorAll('img.brand-logo'));
    check('two header logos', logos.length === 2, 'found ' + logos.length);
    check('logos sit on the page background, not in the topbar', document.querySelector('.topbar img') === null && document.querySelector('main img.brand-logo') !== null);
    check('logos have the PBGC alt text', logos.every(im => im.getAttribute('alt') === ALT));
    check('logos are embedded data URIs, not fetches', logos.every(im => (im.getAttribute('src') || '').indexOf('data:image/png;base64,') === 0));
    check('logos are different files (light vs dark)', logos[0].getAttribute('src') !== logos[1].getAttribute('src'));
    const lightLogo = document.querySelector('.brand-logo-light');
    const darkLogo = document.querySelector('.brand-logo-dark');
    const disp = (el) => window.getComputedStyle(el).display;
    check('light logo shown, dark logo hidden (light theme)', disp(lightLogo) === 'block' && disp(darkLogo) === 'none', disp(lightLogo) + ' / ' + disp(darkLogo));
    toggle.click(); // dark
    check('dark logo shown, light logo hidden (dark theme)', disp(darkLogo) === 'block' && disp(lightLogo) === 'none', disp(lightLogo) + ' / ' + disp(darkLogo));
    toggle.click(); // back to light
    // Logo display width at the 40px CSS height: 750/250 -> 120px, 751/251 -> ~120px. Minimum 60px.
    const sizes = logos.map(im => pngSize(im.getAttribute('src')));
    const widths = sizes.map(s => Math.round(40 * s.w / s.h));
    check('logos show at least 60px wide', widths.every(w => w >= 60), widths.join('px, ') + 'px');
  } catch (e) {
    check('no exception during opaque-origin browser test', false, e.message);
  }

  try {
    // ---- Part 3: persistence ----
    const { window } = stored.dom;
    const { document } = window;
    check('saved dark choice loads dark', document.documentElement.getAttribute('data-theme') === 'dark' && window.DEL.state.theme === 'dark');
    const toggle = document.getElementById('theme-toggle');
    toggle.click(); // to light
    check('toggle to light persists "light"', window.localStorage.getItem('del-theme') === 'light');
    toggle.click(); // to dark
    check('toggle to dark persists "dark"', window.localStorage.getItem('del-theme') === 'dark');
  } catch (e) {
    check('no exception during persistence browser test', false, e.message);
  }
  done();
}, 200);
