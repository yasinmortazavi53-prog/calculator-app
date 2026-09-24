# Calculator App

A clean, responsive web calculator built with **vanilla HTML, CSS, and JavaScript**.
No frameworks, no dependencies, no `eval()`.

## Features

### Core (Standard)
- Basic arithmetic: addition, subtraction, multiplication, division
- Decimal numbers
- Clear (C) and backspace
- Chained operations (e.g. `2 + 3 + 4`)
- Division-by-zero error handling ("Error" message)
- Smart number formatting with thousands separators
- Full keyboard support: digits, `+ - * /`, `Enter` (=), `Backspace`, `Escape` (C)

### Themes — Light & Dark
- Light (day) and dark (night) themes
- Toggle button in the top bar (sun / moon)
- Preference saved in `localStorage` and respects `prefers-color-scheme`
- Smooth transitions, adapted shadows, borders and display colors for each theme

### Modes — Standard & Scientific
- **Standard**: classic 4-function layout (18 buttons, compact 340px shell)
- **Scientific**: expanded panel with advanced functions:
  - Percent (`%`), square root (`√`), square (`x²`), power (`xʸ` / `^`), reciprocal (`1/x`)
  - Sign toggle (`±`), sine / cosine / tangent (`sin`, `cos`, `tan` in radians), `log` (base 10), `ln`, `exp`
  - Factorial (`x!`), constants `π` and `e`
- Toggle button in the top bar switches between Standard and Scientific
- Mode saved in `localStorage`; scientific panel animates in/out and widens the calculator to 420px on desktop
- Fully keyboard compatible; scientific operations work via mouse and via delegated handlers without `eval()`

## Project Structure

```
calculator-app/
├── index.html          # Markup (top bar, display + history, scientific panel, standard grid)
├── css/
│   └── style.css       # Styles (CSS variables for light/dark, responsive, animations)
├── js/
│   └── calculator.js   # Calculator logic (state machine) + DOM wiring + theme/mode
├── tests/
│   └── calculator.test.js
├── README.md
└── .gitignore
```

## Getting Started

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

- Use the **moon / sun** button to switch Light / Dark theme.
- Use the **Scientific / Standard** pill to toggle advanced functions.

## Testing

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
Scientific functions and theme/mode toggles are additive and do not break the 18-button standard grid.

## Roadmap

- [x] Step 1 — Project setup, base calculator (4 operations)
- [x] Step 2 — Integration test suite (jsdom), 48/48 passing
- [x] Step 3 — Light / Dark themes + Standard / Scientific modes
