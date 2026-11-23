# AI Environmental Footprint — Open-Source Scale & Math Validator

An interactive, zero-dependency web platform for auditing the real energy, water, and carbon footprint of AI inference against everyday baselines and macro-grid realities.

## Key Features
- **Decoupled Data Schema (`data/benchmarks.json`):** Every constant, range, and boundary assumption lives in a versioned JSON file under `CC-BY-4.0`.
- **Dual Stress-Test Baselines:** Instantly flip between **Modern 2025/2026 Optimized (`0.24 Wh` / `3.0 mL`)** and **Conservative Older IEA (`2.9 Wh` / `10.0 mL`)** assumptions.
- **Lifecycle Boundary Toggle:** Optionally include amortized model training and GPU embodied carbon.
- **URL-Encoded Scenarios:** Every slider, toggle, and custom constant override syncs to URL query parameters so anyone clicking your link sees your exact math.
- **Multi-Format Audit Export:** Export your scenario as **JSON**, **CSV**, or a **1200×630 PNG social summary card**.
- **Automated CI Math Verification:** Every pull request runs `node --test` against `src/calculator.js` to prevent unit-conversion regressions.

## Quick Local Run & GitHub Pages Deployment
Because browsers restrict `fetch()` over `file://`, run a lightweight local server during development (the app also includes an embedded fallback if opened directly):

```bash
python3 -m http.server 8080
# Run unit tests:
node --test tests/calculator.test.js
```

To publish live on GitHub Pages:
1. Push this repository to GitHub (e.g., `GIL794/ai-footprint-audit`).
2. Go to **Settings → Pages → Build and deployment → Source: Deploy from a branch (`main` / `/root`)**.

## Licenses
- **Source Code (`index.html`, `src/`, `tests/`):** MIT License
- **Dataset & Methodology (`data/benchmarks.json`):** Creative Commons Attribution 4.0 International (`CC-BY-4.0`)
