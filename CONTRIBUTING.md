# Contributing & Challenging the Numbers

We welcome pull requests and data audits from engineers, climate researchers, and critics.

## Rules for Updating Constants
1. **Never edit numbers inside `index.html`.** All defaults belong in `data/benchmarks.json`.
2. **Cite primary sources only.** Include a DOI, PDF link, or official corporate sustainability report with page/table numbers.
3. **Specify system boundaries.** Clearly note whether water figures include indirect thermoelectric cooling or only on-site evaporative cooling, and whether energy figures include embodied hardware carbon.
4. **Run tests before opening a PR:**
   ```bash
   node --test tests/calculator.test.js
   ```
