/* ============================================
   Calculator App — Step 1: Core logic
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

class Calculator {
    constructor() {
        this.clear();
    }

    clear() {
        this.current = '';        // operand being typed
        this.previous = null;     // stored operand
        this.operation = null;    // pending operator: + - * /
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

        // Chain: 2 + 3 + ... → compute 2 + 3 first
        if (this.previous !== null && this.operation !== null) {
            this.compute();
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
            default: return;
        }

        // Remove floating point noise (e.g. 0.1 + 0.2 = 0.30000000000000004)
        this.current = String(parseFloat(result.toPrecision(12)));
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

    getDisplayText() {
        if (this.error) return 'Error';
        if (this.current === '') {
            return this.previous !== null ? formatNumber(this.previous) : '0';
        }
        return formatNumber(this.current);
    }
}

/* ---------- DOM wiring ---------- */

const displayElement = document.getElementById('display');
const calculator = new Calculator();

function updateDisplay() {
    const text = calculator.getDisplayText();
    displayElement.textContent = text;

    // Shrink font for long results so they fit the screen
    displayElement.style.fontSize = text.length > 12 ? '20px' : '28px';
}

const actions = {
    clear: () => calculator.clear(),
    delete: () => calculator.deleteDigit(),
    equals: () => calculator.equals(),
    decimal: () => calculator.inputDecimal(),
};

document.querySelector('.buttons').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.dataset.digit !== undefined) {
        calculator.inputDigit(button.dataset.digit);
    } else if (button.dataset.operation !== undefined) {
        calculator.setOperation(button.dataset.operation);
    } else if (button.dataset.action !== undefined) {
        actions[button.dataset.action]();
    }

    updateDisplay();
});

/* ---------- Keyboard support ---------- */

window.addEventListener('keydown', (event) => {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        calculator.inputDigit(key);
    } else if (key === '.') {
        calculator.inputDecimal();
    } else if (['+', '-', '*', '/'].includes(key)) {
        calculator.setOperation(key);
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
