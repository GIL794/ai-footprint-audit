# Contributing and challenging the numbers

Pull requests and data audits from engineers, researchers and critics are welcome.

## Rules for changing a number
1. **Edit numbers only in `data/benchmarks.json`**, then run `npm run build` to regenerate `data/benchmarks.js`. Never put a number in `index.html` or `src/calculator.js`.
2. **Cite primary sources.** Give a link to the paper, report or official dataset and the table or page. Secondary articles can point you to a source but are not the source.
3. **State the boundary.** Say whether a water figure includes power-plant water, whether an energy figure includes the user's device and network, and whether weights are raw or prepared.
4. **Set the `status`** honestly: `verified` only if you opened the primary source and the number matches; `derived` if you worked it out from one (explain how in `note`); otherwise `partly_verified`, `unverified` or `editor_estimate`.
5. **Do not swap one unsourced number for another.** If no source exists, say so.
6. Run `npm test` before opening a pull request. It checks the data schema, that every constant has a source and status, and that the generated file is current.

## Keeping the page easy to use
Changes should keep the first screen understandable by someone with no background: plain words first, jargon only in the glossary or the optional section.
