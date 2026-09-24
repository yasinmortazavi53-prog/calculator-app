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

## Roadmap

- [x] Step 1 — Project setup, base calculator (4 operations)
- [ ] Step 2 — TBD
