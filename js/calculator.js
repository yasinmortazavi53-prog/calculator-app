/* ============================================
   Calculator App — Core logic + Themes + Modes
   Pure state machine, no eval().
   ============================================ */

const MAX_INPUT_DIGITS = 15; // max digits typed per operand

/**
 * Format an operand string with thousands separators (en-US).
 */
function formatNumber(value) {
    const str = String(value);

    // Scientific notation, infinity, etc. — show as is
    if (str.includes('e') || str.includes('Infinity') || str.includes('NaN')) {
        return str;
    }

    const [integer, decimal] = str.split('.');
    const formattedInteger = Number(integer).toLocaleString('en-US');

    return decimal !== undefined
        ? `${formattedInteger}.${decimal}`
        : formattedInteger;
}

function formatResult(num) {
    if (!Number.isFinite(num)) return String(num);
    return String(parseFloat(num.toPrecision(12)));
}

class Calculator {
    constructor() {
        this.clear();
    }

    clear() {
        this.current = '';        // operand being typed
        this.previous = null;     // stored operand
        this.operation = null;    // pending operator: + - * / ^
        this.justEvaluated = false;
        this.error = false;
    }

    inputDigit(digit) {
        if (this.error) this.clear();

        // After "=", typing a digit starts a fresh calculation
        if (this.justEvaluated) {
            this.current = '';
            this.justEvaluated = false;
        }

        if (this.current.replace(/[-.]/g, '').length >= MAX_INPUT_DIGITS) return;
        if (digit === '0' && this.current === '0') return;

        this.current = this.current === '0' ? digit : this.current + digit;
    }

    inputDecimal() {
        if (this.error) this.clear();

        if (this.justEvaluated) {
            this.current = '';
            this.justEvaluated = false;
        }

        if (this.current === '') {
            this.current = '0.';
        } else if (!this.current.includes('.')) {
            this.current += '.';
        }
    }

    setOperation(operation) {
        if (this.error) this.clear();

        // Nothing to operate on yet
        if (this.current === '' && this.previous === null) return;

        // Change the pending operator
        if (this.current === '' && this.previous !== null) {
            this.operation = operation;
            return;
        }

        // Chain: 2 + 3 + ... -> compute 2 + 3 first
        if (this.previous !== null && this.operation !== null) {
            this.compute();
            if (this.error) return;
        }

        this.previous = this.current;
        this.operation = operation;
        this.current = '';
        this.justEvaluated = false;
    }

    equals() {
        if (this.error) return;
        if (this.previous === null || this.operation === null || this.current === '') return;

        this.compute();
        this.justEvaluated = true;
    }

    compute() {
        const a = parseFloat(this.previous);
        const b = parseFloat(this.current);
        let result;

        switch (this.operation) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/':
                if (b === 0) {
                    this.error = true;
                    return;
                }
                result = a / b;
                break;
            case '^':
                result = Math.pow(a, b);
                if (!Number.isFinite(result)) {
                    // overflow or invalid
                    if (Number.isNaN(result)) {
                        this.error = true;
                        return;
                    }
                }
                break;
            default: return;
        }

        // Remove floating point noise (e.g. 0.1 + 0.2 = 0.30000000000000004)
        this.current = formatResult(result);
        this.previous = null;
        this.operation = null;
    }

    deleteDigit() {
        if (this.error) {
            this.clear();
            return;
        }
        if (this.justEvaluated || this.current === '') return;

        this.current = this.current.slice(0, -1);
    }

    // ---- Scientific unary helpers ----

    _applyUnary(fn) {
        if (this.error) this.clear();
        if (this.justEvaluated) this.justEvaluated = false;
        if (this.current === '') return;
        const value = parseFloat(this.current);
        if (Number.isNaN(value)) return;
        const result = fn(value);
        if (result === null || result === undefined || Number.isNaN(result) || !Number.isFinite(result)) {
            // treat NaN/Infinity as error for sqrt/log etc, but large finite allowed
            if (result === null || Number.isNaN(result) || !Number.isFinite(result) && Math.abs(result) === Infinity) {
                // For overflow we still show number if finite, otherwise error
                if (!Number.isFinite(result)) {
                    this.error = true;
                    return;
                }
            }
            this.error = true;
            return;
        }
        this.current = formatResult(result);
    }

    percent() {
        if (this.error) this.clear();
        if (this.current === '') return;
        const v = parseFloat(this.current);
        this.current = formatResult(v / 100);
        this.justEvaluated = false;
    }

    sqrt() {
        this._applyUnary((v) => {
            if (v < 0) return NaN;
            return Math.sqrt(v);
        });
    }

    square() {
        this._applyUnary((v) => v * v);
    }

    reciprocal() {
        if (this.error) this.clear();
        if (this.current === '') return;
        const v = parseFloat(this.current);
        if (v === 0) {
            this.error = true;
            return;
        }
        this.current = formatResult(1 / v);
        this.justEvaluated = false;
    }

    negate() {
        if (this.error) {
            this.clear();
            return;
        }
        if (this.justEvaluated) this.justEvaluated = false;
        if (this.current === '') {
            // if no current but have previous display, toggle that context? keep simple
            return;
        }
        if (this.current.startsWith('-')) {
            this.current = this.current.slice(1);
        } else {
            this.current = '-' + this.current;
        }
    }

    sin() {
        this._applyUnary((v) => Math.sin(v));
    }

    cos() {
        this._applyUnary((v) => Math.cos(v));
    }

    tan() {
        this._applyUnary((v) => Math.tan(v));
    }

    log() {
        this._applyUnary((v) => {
            if (v <= 0) return NaN;
            return Math.log10(v);
        });
    }

    ln() {
        this._applyUnary((v) => {
            if (v <= 0) return NaN;
            return Math.log(v);
        });
    }

    exp() {
        this._applyUnary((v) => Math.exp(v));
    }

    factorial() {
        if (this.error) this.clear();
        if (this.current === '') return;
        const v = parseFloat(this.current);
        if (!Number.isInteger(v) || v < 0 || v > 170) {
            this.error = true;
            return;
        }
        let res = 1;
        for (let i = 2; i <= v; i++) res *= i;
        this.current = formatResult(res);
        this.justEvaluated = false;
    }

    inputConstant(name) {
        if (this.error) this.clear();
        if (this.justEvaluated) {
            this.current = '';
            this.justEvaluated = false;
        }
        let value;
        if (name === 'pi') value = Math.PI;
        else if (name === 'e') value = Math.E;
        else return;
        // respect digit limit via formatting
        this.current = formatResult(value);
    }

    getDisplayText() {
        if (this.error) return 'Error';
        if (this.current === '') {
            return this.previous !== null ? formatNumber(this.previous) : '0';
        }
        return formatNumber(this.current);
    }

    getHistoryText() {
        if (this.error) return '';
        if (this.previous !== null && this.operation !== null) {
            const symbols = { '/': '÷', '*': '×', '+': '+', '-': '−', '^': '^' };
            const opSymbol = symbols[this.operation] || this.operation;
            return `${formatNumber(this.previous)} ${opSymbol}`;
        }
        if (this.justEvaluated && this.previous === null && this.operation === null && this.current !== '') {
            return '';
        }
        return '';
    }
}

/* ---------- DOM wiring ---------- */

const displayElement = document.getElementById('display');
const historyElement = document.getElementById('history');
const calculatorEl = document.querySelector('.calculator');
const themeToggle = document.getElementById('theme-toggle');
const modeToggle = document.getElementById('mode-toggle');
const scientificPanel = document.getElementById('scientific-panel');

const calculator = new Calculator();

function updateDisplay() {
    const text = calculator.getDisplayText();
    if (displayElement) {
        displayElement.textContent = text;
        displayElement.style.fontSize = text.length > 12 ? '20px' : text.length > 9 ? '24px' : '30px';
    }
    if (historyElement) {
        historyElement.textContent = calculator.getHistoryText();
    }
}

const actions = {
    clear: () => calculator.clear(),
    delete: () => calculator.deleteDigit(),
    equals: () => calculator.equals(),
    decimal: () => calculator.inputDecimal(),
};

const scientificActions = {
    percent: () => calculator.percent(),
    sqrt: () => calculator.sqrt(),
    square: () => calculator.square(),
    reciprocal: () => calculator.reciprocal(),
    negate: () => calculator.negate(),
    sin: () => calculator.sin(),
    cos: () => calculator.cos(),
    tan: () => calculator.tan(),
    log: () => calculator.log(),
    ln: () => calculator.ln(),
    exp: () => calculator.exp(),
    factorial: () => calculator.factorial(),
    pi: () => calculator.inputConstant('pi'),
    e: () => calculator.inputConstant('e'),
};

// Standard buttons delegation
const buttonsContainer = document.querySelector('.buttons');
if (buttonsContainer) {
    buttonsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        if (button.dataset.digit !== undefined) {
            calculator.inputDigit(button.dataset.digit);
        } else if (button.dataset.operation !== undefined) {
            calculator.setOperation(button.dataset.operation);
        } else if (button.dataset.action !== undefined) {
            const act = actions[button.dataset.action];
            if (act) act();
        }

        updateDisplay();
    });
}

// Scientific panel delegation
if (scientificPanel) {
    scientificPanel.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        if (button.dataset.operation !== undefined) {
            calculator.setOperation(button.dataset.operation);
        } else if (button.dataset.action !== undefined) {
            const key = button.dataset.action;
            if (scientificActions[key]) {
                scientificActions[key]();
            } else if (actions[key]) {
                actions[key]();
            }
        }

        updateDisplay();
    });
}

/* ---------- Keyboard support ---------- */

window.addEventListener('keydown', (event) => {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        calculator.inputDigit(key);
    } else if (key === '.') {
        calculator.inputDecimal();
    } else if (['+', '-', '*', '/'].includes(key)) {
        calculator.setOperation(key);
    } else if (key === '^') {
        calculator.setOperation('^');
    } else if (key === '%') {
        calculator.percent();
    } else if (key === 'Enter' || key === '=') {
        calculator.equals();
        event.preventDefault();
    } else if (key === 'Backspace') {
        calculator.deleteDigit();
    } else if (key === 'Escape') {
        calculator.clear();
    } else {
        return;
    }

    updateDisplay();
});

/* ---------- Theme & Mode ---------- */

function safeGet(key) {
    try {
        return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch {
        return null;
    }
}

function safeSet(key, value) {
    try {
        if (window.localStorage) window.localStorage.setItem(key, value);
    } catch {}
}

function getPreferredTheme() {
    const saved = safeGet('calc-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    try {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch {}
    return 'light';
}

function applyTheme(theme) {
    const t = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
    if (themeToggle) {
        const icon = themeToggle.querySelector('.theme-icon');
        if (icon) icon.textContent = t === 'dark' ? '☀' : '☾';
        themeToggle.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        themeToggle.title = t === 'dark' ? 'Light mode' : 'Dark mode';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    safeSet('calc-theme', next);
}

function getPreferredMode() {
    const saved = safeGet('calc-mode');
    if (saved === 'scientific' || saved === 'standard') return saved;
    return 'standard';
}

function applyMode(mode) {
    const isSci = mode === 'scientific';
    if (calculatorEl) {
        calculatorEl.classList.toggle('mode-scientific', isSci);
    }
    if (scientificPanel) {
        if (isSci) scientificPanel.removeAttribute('hidden');
        else scientificPanel.setAttribute('hidden', '');
    }
    if (modeToggle) {
        const label = modeToggle.querySelector('.mode-label');
        if (label) label.textContent = isSci ? 'Standard' : 'Scientific';
        modeToggle.setAttribute('aria-pressed', String(isSci));
        modeToggle.title = isSci ? 'Switch to standard mode' : 'Switch to scientific mode';
    }
}

function toggleMode() {
    const isSci = calculatorEl ? calculatorEl.classList.contains('mode-scientific') : false;
    const next = isSci ? 'standard' : 'scientific';
    applyMode(next);
    safeSet('calc-mode', next);
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        toggleTheme();
    });
}

if (modeToggle) {
    modeToggle.addEventListener('click', () => {
        toggleMode();
    });
}

// Initialize theme and mode without flash
applyTheme(getPreferredTheme());
applyMode(getPreferredMode());
updateDisplay();

// Expose for testing / debugging (optional)
window.Calculator = Calculator;
window.calculatorInstance = calculator;
