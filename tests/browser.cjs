// Browser test: loads del-generator.html in jsdom and drives it like a user.
// Part 1 — opaque origin (a file: URL): the v0.1.0 localStorage bug. Every
// storage access must go through delSafeStorage(); this proves the app
// survives a blocked localStorage and the demo button works.
// Part 2 — theme toggle + logo: the toggle flips data-theme on the root,
// the dark page background is #000, the header stays brand blue, and the
// one white (wt) PBGC logo sits in the blue header in both themes.
// Part 4 — HeaderNav: skip link first, nav links (not buttons) with
// aria-current, hash links + hashchange, disclosure menu with Escape
// and focus return.
// Part 5 — Welcome and Help are their own pages: 4 nav links, the
// landing page shows only the DEL workflow, Try the demo from the
// Welcome page loads the demo and switches to the DEL view.
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

// Media-query rules: find the @media block whose condition mentions `cond`
// and return its inner rules.
function mediaRules(document, cond) {
  for (const sheet of document.styleSheets) {
    for (const r of sheet.cssRules) {
      if (r.conditionText && r.conditionText.indexOf(cond) !== -1) return r.cssRules;
    }
  }
  return null;
}
function ruleText(rules, selector) {
  if (!rules) return '';
  for (const r of rules) {
    if (r.selectorText === selector) return r.cssText || '';
  }
  return '';
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

    // ---- logo: one white (wt) logo in the blue header, both themes ----
    const logos = Array.from(document.querySelectorAll('img.brand-logo'));
    check('exactly one logo img in the HTML', logos.length === 1, 'found ' + logos.length);
    check('logo sits inside the blue header, not in main', document.querySelector('.topbar img.brand-logo') !== null && document.querySelector('main img.brand-logo') === null);
    check('no brand-row left in the page', document.querySelector('.brand-row') === null);
    const logo = logos[0];
    check('logo has the PBGC alt text', logo.getAttribute('alt') === ALT);
    check('logo is an embedded data URI, not a fetch', (logo.getAttribute('src') || '').indexOf('data:image/png;base64,') === 0);
    const wtB64 = fs.readFileSync(path.join(__dirname, '..', 'assets', 'logos', 'PBGC_logo_name_hor_wt.png')).toString('base64');
    check('logo data URI is the white (wt) source PNG, byte-identical', logo.getAttribute('src') === 'data:image/png;base64,' + wtB64);
    const fcB64 = fs.readFileSync(path.join(__dirname, '..', 'assets', 'logos', 'PBGC_logo_name_hor_fc.png')).toString('base64');
    check('full-color (fc) logo is NOT in the HTML', html.indexOf(fcB64) === -1);
    const disp = (el) => window.getComputedStyle(el).display;
    check('logo visible in light theme', disp(logo) === 'block', disp(logo));
    toggle.click(); // dark
    check('logo still visible in dark theme (no per-theme switching)', disp(logo) === 'block', disp(logo));
    check('header stays brand blue in dark, logo on blue', cssVar(document, ':root', '--blue') === '#002D72' && (cssRule(document, '.topbar') || { style: { background: '' } }).style.background === 'var(--blue)');
    toggle.click(); // back to light
    // Logo display width at the 52px CSS height: 751/251 -> ~156px. Minimum 60px.
    // PBGC letters are 74px of the 251px canvas, so at 52px they render ~15px
    // against the 20px title (was ~12px at 40px, which read too small).
    check('logo is 52px high on desktop (CSS rule)', (cssRule(document, '.brand-logo') || { style: { height: '' } }).style.height === '52px');
    const size = pngSize(logo.getAttribute('src'));
    const width = Math.round(52 * size.w / size.h);
    check('logo shows at least 60px wide', width >= 60, width + 'px');
    // Narrow screen (640px): logo 44px (letters ~13px, still readable),
    // toggle shows its icon only, header gap shrinks, so the row fits.
    const media640 = mediaRules(document, '640');
    check('640px breakpoint exists', !!media640);
    check('logo is 44px high at 640px', !!media640 && ruleText(media640, '.brand-logo').indexOf('44px') !== -1);
    check('toggle label hides at 640px (icon only)', !!media640 && ruleText(media640, '.theme-toggle-label').indexOf('none') !== -1);
    check('header gap shrinks to 0.5rem at 640px', !!media640 && ruleText(media640, '.topbar-row').indexOf('.5rem') !== -1);
    const narrowWidth = Math.round(44 * size.w / size.h);
    check('logo still at least 60px wide at 640px', narrowWidth >= 60, narrowWidth + 'px');
    // Toggle label lives in a span and flips with the theme.
    const label = toggle.querySelector('.theme-toggle-label');
    check('toggle label is a span', !!label);
    check('toggle label reads Dark in light theme', !!label && label.textContent === 'Dark');
  } catch (e) {
    check('no exception during opaque-origin browser test', false, e.message);
  }

  try {
    // ---- Part 4: HeaderNav (opaque origin) ----
    const { window } = opaque.dom;
    const { document } = window;
    const skip = document.querySelector('.skip-link');
    check('skip link exists', !!skip);
    check('skip link is the first element in the body', document.body.firstElementChild === skip);
    check('skip link points at main', !!skip && skip.getAttribute('href') === '#main');
    check('skip link text', !!skip && skip.textContent.trim() === 'Skip to main content');
    check('main has id="main"', document.querySelector('main').getAttribute('id') === 'main');
    const navDel = document.getElementById('nav-del');
    const navM = document.getElementById('nav-matches');
    check('nav items are links, not buttons', navDel.tagName === 'A' && navM.tagName === 'A');
    check('nav links have real hrefs', navDel.getAttribute('href') === '#del' && navM.getAttribute('href') === '#ranking');
    check('nav links carry data-view', navDel.getAttribute('data-view') === 'del' && navM.getAttribute('data-view') === 'ranking');
    check('current link has aria-current="page" on load', navDel.getAttribute('aria-current') === 'page' && navM.getAttribute('aria-current') === null);
    check('nav list is a <ul>', document.getElementById('views-list').tagName === 'UL');
    // view switching
    navM.click();
    check('clicking Match ranking shows the ranking view', document.getElementById('view-matches').hidden === false && document.getElementById('view-del').hidden === true);
    check('aria-current moves to Match ranking', navM.getAttribute('aria-current') === 'page' && navDel.getAttribute('aria-current') === null);
    check('URL hash follows the view', window.location.hash === '#ranking', window.location.hash);
    navDel.click();
    check('clicking DEL generator shows the DEL view', document.getElementById('view-del').hidden === false && document.getElementById('view-matches').hidden === true);
    check('aria-current moves back to DEL generator', navDel.getAttribute('aria-current') === 'page' && navM.getAttribute('aria-current') === null);
    check('URL hash follows back', window.location.hash === '#del', window.location.hash);
    // hashchange: pasted URL / back-forward
    window.location.hash = '#ranking';
    window.dispatchEvent(new window.Event('hashchange'));
    check('hashchange to #ranking shows the ranking view', document.getElementById('view-matches').hidden === false && navM.getAttribute('aria-current') === 'page');
    window.location.hash = '#del';
    window.dispatchEvent(new window.Event('hashchange'));
    check('hashchange to #del shows the DEL view', document.getElementById('view-del').hidden === false && navDel.getAttribute('aria-current') === 'page');
    // disclosure menu
    const menuBtn = document.getElementById('menu-toggle');
    const nav = document.getElementById('views-nav');
    check('Menu button exists', !!menuBtn);
    check('Menu button starts collapsed', menuBtn.getAttribute('aria-expanded') === 'false' && !nav.classList.contains('open'));
    check('Menu button controls the link list', menuBtn.getAttribute('aria-controls') === 'views-list');
    menuBtn.click();
    check('Menu button opens the menu', menuBtn.getAttribute('aria-expanded') === 'true' && nav.classList.contains('open'));
    navM.click();
    check('clicking a link closes the menu', menuBtn.getAttribute('aria-expanded') === 'false' && !nav.classList.contains('open'));
    menuBtn.click();
    check('Menu button opens the menu again', nav.classList.contains('open'));
    navM.focus();
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
    check('Escape closes the menu', menuBtn.getAttribute('aria-expanded') === 'false' && !nav.classList.contains('open'));
    check('Escape returns focus to the Menu button', document.activeElement === menuBtn);
    // CSS rules: nav bar style + 640px disclosure breakpoint
    const media640 = mediaRules(document, '640');
    check('640px disclosure breakpoint exists', !!media640);
    check('Menu button shows at 640px', !!media640 && ruleText(media640, '.menu-toggle').indexOf('inline-flex') !== -1);
    check('link list hides at 640px until opened', !!media640 && ruleText(media640, '.views-list').indexOf('none') !== -1);
    check('current link has a 3px bottom border', (cssRule(document, '.nav-link[aria-current="page"]') || { style: { borderBottom: '' } }).style.borderBottom.indexOf('3px') !== -1);
    check('nav links are 44px targets', (cssRule(document, '.nav-link') || { style: { minHeight: '' } }).style.minHeight === '44px');
  } catch (e) {
    check('no exception during HeaderNav browser test', false, e.message);
  }

  try {
    // ---- Part 5: Welcome and Help are their own pages ----
    const { window } = opaque.dom;
    const { document } = window;
    const navDel = document.getElementById('nav-del');
    const navM = document.getElementById('nav-matches');
    const navW = document.getElementById('nav-welcome');
    const navH = document.getElementById('nav-help');
    const viewDel = document.getElementById('view-del');
    const viewM = document.getElementById('view-matches');
    const viewW = document.getElementById('view-welcome');
    const viewH = document.getElementById('view-help');
    navDel.click(); // back to the landing view (Part 4 ended on ranking)
    check('nav has exactly 4 links', document.querySelectorAll('#views-list a.nav-link').length === 4);
    check('nav links are in order DEL, ranking, Welcome, Help',
      Array.from(document.querySelectorAll('#views-list a.nav-link')).map(a => a.getAttribute('data-view')).join(',') === 'del,ranking,welcome,help');
    check('Welcome link has real href + data-view', navW.getAttribute('href') === '#welcome' && navW.getAttribute('data-view') === 'welcome');
    check('Help link has real href + data-view', navH.getAttribute('href') === '#help' && navH.getAttribute('data-view') === 'help');
    // landing page: only the DEL workflow
    check('landing shows the DEL view', viewDel.hidden === false && viewM.hidden === true && viewW.hidden === true && viewH.hidden === true);
    check('welcome section is not inside the DEL view', document.querySelector('#view-del #welcome') === null);
    check('help section is not inside the DEL view', document.querySelector('#view-del #help') === null);
    check('welcome section lives in its own view', document.querySelector('#view-welcome #welcome') !== null);
    check('help section lives in its own view', document.querySelector('#view-help #help') !== null);
    check('stepper is rendered on the landing page', document.getElementById('stepper').children.length === 5);
    // aria-current across all four views
    const cur = () => [navDel, navM, navW, navH].map(n => n.getAttribute('aria-current') === 'page' ? '1' : '0').join('');
    check('aria-current is on DEL only at landing', cur() === '1000', cur());
    navW.click();
    check('clicking Welcome shows the welcome view', viewW.hidden === false && viewDel.hidden === true && viewM.hidden === true && viewH.hidden === true);
    check('aria-current moves to Welcome', cur() === '0010', cur());
    check('URL hash follows to #welcome', window.location.hash === '#welcome', window.location.hash);
    navH.click();
    check('clicking Help shows the help view', viewH.hidden === false && viewDel.hidden === true && viewM.hidden === true && viewW.hidden === true);
    check('aria-current moves to Help', cur() === '0001', cur());
    check('URL hash follows to #help', window.location.hash === '#help', window.location.hash);
    navM.click();
    check('clicking Match ranking shows the ranking view', viewM.hidden === false && viewDel.hidden === true && viewW.hidden === true && viewH.hidden === true);
    check('aria-current moves to Match ranking', cur() === '0100', cur());
    // hash routing for the two new views
    window.location.hash = '#welcome';
    window.dispatchEvent(new window.Event('hashchange'));
    check('hashchange to #welcome shows the welcome view', viewW.hidden === false && navW.getAttribute('aria-current') === 'page');
    window.location.hash = '#help';
    window.dispatchEvent(new window.Event('hashchange'));
    check('hashchange to #help shows the help view', viewH.hidden === false && navH.getAttribute('aria-current') === 'page');
    window.location.hash = '#bogus';
    window.dispatchEvent(new window.Event('hashchange'));
    check('unknown hash falls back to the DEL view', viewDel.hidden === false && navDel.getAttribute('aria-current') === 'page');
    window.location.hash = '';
    window.dispatchEvent(new window.Event('hashchange'));
    check('empty hash falls back to the DEL view', viewDel.hidden === false);
    // Try the demo from the Welcome page
    navW.click();
    const demoBtn = document.querySelector('#view-welcome [data-action="demo"]');
    check('Try the demo button is on the Welcome page', !!demoBtn);
    demoBtn.click();
    check('Try the demo leaves the demo case loaded', !!window.DEL.state.data && window.DEL.state.data.planMetadata.caseNumber === '98765400');
    check('Try the demo switches to the DEL view', viewDel.hidden === false && viewW.hidden === true);
    check('Try the demo moves to Review (step 2)', window.DEL.state.step === 2);
    check('URL hash follows to #del after the demo', window.location.hash === '#del', window.location.hash);
    // the old welcome buttons are gone
    check('no Hide this button', document.querySelector('[data-action="hide-welcome"]') === null);
    check('no Show the welcome again button', document.querySelector('[data-action="show-welcome"]') === null);
    // disclosure menu with 4 links
    const menuBtn = document.getElementById('menu-toggle');
    const nav = document.getElementById('views-nav');
    menuBtn.click();
    check('Menu button opens the menu with 4 links', nav.classList.contains('open') && document.querySelectorAll('#views-list a.nav-link').length === 4);
    navH.click();
    check('clicking a link closes the menu', menuBtn.getAttribute('aria-expanded') === 'false' && !nav.classList.contains('open'));
    menuBtn.click();
    navH.focus();
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
    check('Escape closes the menu with 4 links', menuBtn.getAttribute('aria-expanded') === 'false' && !nav.classList.contains('open'));
    check('Escape returns focus to the Menu button', document.activeElement === menuBtn);
    navDel.click();
  } catch (e) {
    check('no exception during Welcome/Help browser test', false, e.message);
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
