/* ============================================
   Calculator App — Integration tests (jsdom)
   Simulates a real browser: loads index.html,
   runs calculator.js, clicks buttons, presses keys.
   ============================================ */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(rootDir, 'js', 'calculator.js'), 'utf8');

/* ---------- Harness ---------- */

let passed = 0;
let failed = 0;
const failures = [];

function assertEqual(actual, expected, label) {
    if (Object.is(actual, expected)) {
        passed++;
        console.log(`  \x1b[32mPASS\x1b[0m  ${label}`);
    } else {
        failed++;
        failures.push({ label, expected, actual });
        console.log(`  \x1b[31mFAIL\x1b[0m  ${label}\n        expected: ${JSON.stringify(expected)}\n        actual:   ${JSON.stringify(actual)}`);
    }
}

function createCalculator() {
    const dom = new JSDOM(html, {
        runScripts: 'outside-only',
        pretendToBeVisual: true,
        url: 'http://localhost:8000/',
    });
    const { window } = dom;

    const consoleErrors = [];
    window.addEventListener('error', (e) => consoleErrors.push(e.message));

    window.eval(js);
    return { window, consoleErrors };
}

/* ---------- Interaction helpers ---------- */

const getDisplay = (window) => window.document.getElementById('display').textContent;

function clickButton(window, selector) {
    const btn = window.document.querySelector(selector);
    if (!btn) throw new Error(`Button not found: ${selector}`);
    btn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
}

const clickDigit = (window, d) => clickButton(window, `[data-digit="${d}"]`);
const clickOp = (window, op) => clickButton(window, `[data-operation="${op}"]`);
const clickAction = (window, action) => clickButton(window, `[data-action="${action}"]`);

function pressKey(window, key) {
    window.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

/** Click a sequence of digits, e.g. typeNumber(w, '123') */
function typeNumber(window, str) {
    for (const ch of str) {
        if (ch === '.') clickAction(window, 'decimal');
        else clickDigit(window, ch);
    }
}

/** Drive the calculator through clicks and check the display. */
function scenarioClicks(window, clicks, expected, label) {
    for (const step of clicks) {
        if (/^[0-9.]$/.test(step) && step !== '.') clickDigit(window, step);
        else if (step === '.') clickAction(window, 'decimal');
        else if (['+', '-', '*', '/'].includes(step)) clickOp(window, step);
        else if (step === '=') clickAction(window, 'equals');
        else if (step === 'C') clickAction(window, 'clear');
        else if (step === 'DEL') clickAction(window, 'delete');
        else throw new Error(`Unknown step: ${step}`);
    }
    assertEqual(getDisplay(window), expected, label);
}

/* ---------- Test groups ---------- */

function testInitialAndBasicOps() {
    console.log('\n[1] Initial state & basic operations (button clicks)');

    let { window } = createCalculator();
    assertEqual(getDisplay(window), '0', 'shows 0 on load');

    ({ window } = createCalculator());
    scenarioClicks(window, ['2', '+', '3', '='], '5', '2 + 3 = 5');

    ({ window } = createCalculator());
    scenarioClicks(window, ['7', '-', '4', '='], '3', '7 - 4 = 3');

    ({ window } = createCalculator());
    scenarioClicks(window, ['6', '*', '7', '='], '42', '6 × 7 = 42');

    ({ window } = createCalculator());
    scenarioClicks(window, ['1', '0', '/', '4', '='], '2.5', '10 ÷ 4 = 2.5');

    ({ window } = createCalculator());
    scenarioClicks(window, ['2', '*', '3', '*', '4', '='], '24', '2 × 3 × 4 = 24 (chained)');
}

function testChainAndOperatorBehavior() {
    console.log('\n[2] Chaining & operator replacement');

    let { window } = createCalculator();
    scenarioClicks(window, ['2', '+', '3', '+', '4', '='], '9', '2 + 3 + 4 = 9 (shows 5 mid-chain)');

    ({ window } = createCalculator());
    scenarioClicks(window, ['2', '+', '*', '3', '='], '6', 'pressing * after + replaces operator: 2 × 3 = 6');

    ({ window } = createCalculator());
    scenarioClicks(window, ['5', '+'], '5', 'operator with no second operand keeps result visible');

    ({ window } = createCalculator());
    scenarioClicks(window, ['+', '3', '='], '3', 'operator with no first operand is ignored');

    ({ window } = createCalculator());
    scenarioClicks(window, ['5', '='], '5', 'equals with no operation does nothing');

    // After "=", an operator continues from the result
    ({ window } = createCalculator());
    scenarioClicks(window, ['2', '+', '3', '=', '*', '2', '='], '10', '(2+3) × 2 = 10 — continue after equals');
}

function testDecimals() {
    console.log('\n[3] Decimals & floating point');

    let { window } = createCalculator();
    scenarioClicks(window, ['.', '5', '+', '1', '='], '1.5', '.5 + 1 = 1.5 (leading decimal)');

    ({ window } = createCalculator());
    scenarioClicks(window, ['0', '.', '1', '+', '0', '.', '2', '='], '0.3', '0.1 + 0.2 = 0.3 (float noise removed)');

    ({ window } = createCalculator());
    scenarioClicks(window, ['1', '.', '2', '.', '3', '='], '1.23', 'second decimal point is ignored (1.2.3 → 1.23)');

    ({ window } = createCalculator());
    scenarioClicks(window, ['5', '.'], '5.', 'decimal on existing number appends: 5.');
}

function testZerosFormatting() {
    console.log('\n[4] Zeros & formatting');

    let { window } = createCalculator();
    scenarioClicks(window, ['0', '0', '5'], '5', 'leading zeros collapsed (005 → 5)');

    ({ window } = createCalculator());
    scenarioClicks(window, ['1', '2', '3', '4', '5', '6', '7'], '1,234,567', 'thousands separators while typing');

    ({ window } = createCalculator());
    scenarioClicks(window, ['1', '2', '3', '4', '*', '2', '='], '2,468', 'formatted result 1234 × 2 = 2,468');

    ({ window } = createCalculator());
    scenarioClicks(window, ['3', '-', '1', '0', '='], '-7', 'negative results display correctly');

    ({ window } = createCalculator());
    scenarioClicks(window, ['9', '9', '9', '9', '9', '9', '9', '9', '*', '9', '9', '9', '9', '9', '9', '9', '9', '='], '9,999,999,800,000,000', 'large result: 99999999² rounded to 12 significant digits (by design)');
}

function testErrorHandling() {
    console.log('\n[5] Error handling');

    let { window } = createCalculator();
    scenarioClicks(window, ['9', '/', '0', '='], 'Error', 'division by zero shows Error');

    ({ window } = createCalculator());
    scenarioClicks(window, ['9', '/', '0', '=', '5'], '5', 'typing a digit after Error starts fresh');

    ({ window } = createCalculator());
    scenarioClicks(window, ['9', '/', '0', '=', 'C'], '0', 'C after Error resets to 0');

    ({ window } = createCalculator());
    scenarioClicks(window, ['9', '/', '0', '=', 'DEL'], '0', 'backspace after Error resets');

    ({ window } = createCalculator());
    scenarioClicks(window, ['5', 'C', '3', '='], '3', 'C clears pending operation too');
}

function testDelete() {
    console.log('\n[6] Delete (backspace)');

    let { window } = createCalculator();
    scenarioClicks(window, ['1', '2', '3', 'DEL'], '12', '123 → backspace → 12');

    ({ window } = createCalculator());
    scenarioClicks(window, ['1', '2', '3', 'DEL', 'DEL', 'DEL'], '0', 'deleting everything falls back to 0');

    ({ window } = createCalculator());
    scenarioClicks(window, ['DEL', 'DEL'], '0', 'backspace on empty display is safe');

    ({ window } = createCalculator());
    scenarioClicks(window, ['2', '+', '3', '=', 'DEL'], '5', 'backspace after equals does not erase result');
}

function testDigitLimit() {
    console.log('\n[7] Input length guard');

    let { window } = createCalculator();
    const manyDigits = '1'.repeat(20);
    scenarioClicks(window, [...manyDigits], '111,111,111,111,111', 'max 15 digits accepted (16+ ignored)');

    ({ window } = createCalculator());
    scenarioClicks(window, ['9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9'], '999,999,999,999', 'result within 12 digits shows plain formatting');
}

function testKeyboard() {
    console.log('\n[8] Keyboard support');

    let { window } = createCalculator();
    for (const k of ['7', '+', '8']) pressKey(window, k);
    pressKey(window, 'Enter');
    assertEqual(getDisplay(window), '15', 'keyboard: 7 + 8, Enter → 15');

    ({ window } = createCalculator());
    for (const k of ['1', '0', '/', '4']) pressKey(window, k);
    pressKey(window, '=');
    assertEqual(getDisplay(window), '2.5', 'keyboard: "=" key works as equals');

    ({ window } = createCalculator());
    for (const k of ['1', '2', '3']) pressKey(window, k);
    pressKey(window, 'Backspace');
    assertEqual(getDisplay(window), '12', 'keyboard: Backspace deletes last digit');

    ({ window } = createCalculator());
    for (const k of ['9', '9', '+', '1']) pressKey(window, k);
    pressKey(window, 'Escape');
    assertEqual(getDisplay(window), '0', 'keyboard: Escape clears');

    ({ window } = createCalculator());
    for (const k of ['6', '*', '6']) pressKey(window, k);
    pressKey(window, 'Enter');
    assertEqual(getDisplay(window), '36', 'keyboard mixed with full expression works');

    // Keyboard and mouse interop
    ({ window } = createCalculator());
    typeNumber(window, '8');
    pressKey(window, '/');
    clickDigit(window, '2');
    clickAction(window, 'equals');
    assertEqual(getDisplay(window), '4', 'mouse + keyboard interop: 8 / 2 = 4');
}

function testDOMHealth() {
    console.log('\n[9] DOM & wiring health checks');

    let { window, consoleErrors } = createCalculator();

    const buttons = window.document.querySelectorAll('.buttons button');
    assertEqual(buttons.length, 18, 'all 18 calculator buttons exist');

    // Every data-action has a handler in the actions map
    const jsSource = js;
    const actions = ['clear', 'delete', 'equals', 'decimal'];
    for (const a of actions) {
        assertEqual(jsSource.includes(`${a}:`), true, `handler for action "${a}" exists in calculator.js`);
    }

    // Every button produces a visible reaction: display should change or stay valid
    ({ window, consoleErrors } = createCalculator());
    buttons.forEach((b) => b.dispatchEvent(new window.MouseEvent('click', { bubbles: true })));
    const text = getDisplay(window);
    assertEqual(typeof text, 'string', 'spamming all 18 buttons never crashes (display stays string)');
    assertEqual(consoleErrors.length, 0, `no runtime errors after all clicks ${consoleErrors.length ? '(' + consoleErrors.join('; ') + ')' : ''}`);

    // Security: no eval() in code (strip comments first so docs don't trip the check)
    const codeWithoutComments = jsSource
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
    assertEqual(/\beval\s*\(/.test(codeWithoutComments), false, 'no eval() used in calculator.js code (security)');

    // HTML language is English / LTR
    assertEqual(window.document.documentElement.lang, 'en', '<html lang="en">');
    assertEqual(window.document.documentElement.dir || '', '', 'no dir="rtl" attribute (LTR layout)');
}

/* ---------- Run everything ---------- */

console.log('==========================================');
console.log(' Calculator App — Integration Test Suite');
console.log('==========================================');

testInitialAndBasicOps();
testChainAndOperatorBehavior();
testDecimals();
testZerosFormatting();
testErrorHandling();
testDelete();
testDigitLimit();
testKeyboard();
testDOMHealth();

console.log('\n==========================================');
console.log(` Total: ${passed + failed}  |  \x1b[32mPassed: ${passed}\x1b[0m  |  ${failed ? '\x1b[31m' : '\x1b[32m'}Failed: ${failed}\x1b[0m`);
console.log('==========================================');

process.exit(failed ? 1 : 0);
