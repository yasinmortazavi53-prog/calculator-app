# Calculator App

A clean, responsive web calculator built with **vanilla HTML, CSS, and JavaScript**.
No frameworks, no dependencies, no `eval()`.

## Features (Step 1)

- Basic arithmetic: addition, subtraction, multiplication, division
- Decimal numbers
- Clear (C) and backspace (⌫)
- Chained operations (e.g. `2 + 3 + 4`)
- Division-by-zero error handling ("Error" message)
- Smart number formatting with thousands separators
- Full keyboard support: digits, `+ - * /`, `Enter` (=), `Backspace` (⌫), `Escape` (C)

## Project Structure

```
calculator-app/
├── index.html          # Markup
├── css/
│   └── style.css       # Styles
├── js/
│   └── calculator.js   # Calculator logic (state machine) + DOM wiring
├── README.md
└── .gitignore
```

## Getting Started

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Testing (Step 2)

Integration tests simulate a real browser via **jsdom**: they load `index.html`,
run `calculator.js`, click every button, and fire keyboard events.

```bash
cd tests
npm install
npm test
```

Covers: basic operations, chaining, decimals & float noise, formatting,
division-by-zero, backspace, digit limits, keyboard & mouse input,
DOM wiring, and an `eval()`-free security check — 48 assertions total.

## Roadmap

- [x] Step 1 — Project setup, base calculator (4 operations)
- [x] Step 2 — Integration test suite (jsdom), 48/48 passing
- [ ] Step 3 — TBD
