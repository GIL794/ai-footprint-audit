# How much water, energy and carbon does AI use?

An interactive page that adds up what a year of your own AI chatbot use costs in water, electricity and carbon, and compares it with beef burgers and video streaming. It is written for people who know nothing about AI or energy units: it opens with a plain question, answers it in a sentence, and keeps the technical detail optional.

Live page: https://gil794.github.io/ai-footprint-audit/

## What is on the page
1. **Try it with your own numbers.** Three sliders (AI questions a day, burgers a week, hours of video a day) and a plain-language answer with everyday comparisons. A choice between a recent, efficient estimate and an older, heavier one shows how far experts disagree, and both results are always shown side by side.
2. **How does that compare?** Four comparisons, each with a one-line explanation, a real-size ratio and an optional squashed scale.
3. **For the curious.** Your own numbers for every constant, the live formula and a table of every number with its source and how far it has been checked against that source.
4. **Words used on this page.** A short glossary.

## How the numbers are handled
- Every constant lives in `data/benchmarks.json` with a source, a link, a scope and a **check status** (checked, derived, partly checked, not yet checked, or the author's estimate). Nothing numeric is hard-coded in `index.html`.
- `data/benchmarks.js` is generated from the JSON (`npm run build`) so the page also works when `index.html` is opened straight from disk. A test fails if the two drift apart.
- Figures that have not been checked against a primary source are labelled on the page and in the table. See `CHANGELOG.md` for what was removed or changed and why.
- Water: the Google estimate counts data centre cooling water only (a lower bound); the older estimate includes power-plant water. AI water is never compared with burger water, because they are different kinds of water. Video water is not estimated.

## Run it
Open `index.html` directly, or serve it:
```bash
python3 -m http.server 8080
```
Tests (Node 20 or later, no dependencies):
```bash
npm test
```
Optional browser checks (need Google Chrome): see `tests/browser/README.md`.

## Publishing on GitHub Pages
Settings, Pages, Build and deployment, Source: deploy from a branch (`main`, `/ (root)`).

## Licences
- Code (`index.html`, `src/`, `scripts/`, `tests/`): MIT
- Data and method (`data/benchmarks.json`): CC-BY-4.0
