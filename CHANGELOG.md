## Accuracy re-review, 23 November 2026
- Rechecked primary sources for Gemini, older ChatGPT energy/water, Ember grid, Google electricity, IEA data centres/video, Google search and beef factors.
- Preserved calculation precision; rounded only for display. Beef derivations now retain 14.922 and 4.995 kg before display rounding.
- Corrected water boundary wording, custom-grid labels, zero benchmark behavior, zero-width chart bars, custom-vs-published comparison rows and fractional shared slider values.
- Stated model/date/boundary limits beside comparisons. Removed growth-tab largest/smallest ratios between unrelated company/global years.
- CSV/JSON now carry exact inputs, sources and boundary caveats. PNG includes omitted life-cycle stages and video boundary.
- Made the override cap consistent between editor and shared links. Reset now clears all scenario choices.
- Fixed clean-environment screenshot path in optional layout checks and added regression tests.

# Changelog

## [1.2.0] - 2026-11-23
Rebuilt after a critical audit of 1.1.0. Nothing here changes the licence or the URL scheme except where noted.

### For first-time visitors
- Plain-language opening, a one-sentence answer with everyday comparisons, and a glossary. Technical controls moved into an optional section.
- Answer shown before the sliders on phones. Plain labels for every control. Shares of water and carbon written out as numbers.
- Both estimates (recent and older) shown side by side so the uncertainty is visible.
- Neutral subtitle replaces the earlier "viral personal guilt-tripping" wording.

### Bugs fixed
- Typing a decimal (for example 0.55) in an override box no longer turns into 550. Boxes are not rewritten while focused.
- Bad links no longer show NaN. Values are checked and clamped, unknown tabs fall back to the first, and the address bar never receives NaN. Old `tab=jevons` links still work.
- The "+33% energy" label is now computed per estimate (33.3% Modern, 15.5% Conservative).
- Mode buttons no longer claim a mode while custom numbers are in use. A notice shows when custom numbers are active, and each override applies on its own (a Conservative link with one override keeps the other Conservative value).
- The PNG card states the real assumptions (estimate, custom numbers, training allowance, per-prompt values).
- The page works from `file://` (classic scripts and a generated `data/benchmarks.js`). The README claim is now true.
- Sources table becomes stacked cards on phones. Per-prompt rows, the training allowance and check status are in the table.
- Constants that were hard-coded in the page and engine moved to the data file. Burger carbon is now overridable.
- Tabs follow the ARIA tab pattern (arrow keys, Home, End, tab panel). Share button has a fallback when copying is blocked. Added favicon, share image and a no-JavaScript message. Touch targets are at least 44 px. Only one polite live region, so screen readers are not flooded on every slider move. Stacked bars have text alternatives.

### Numbers (evidence-based changes)
| Number | Was | Now | Why |
| --- | --- | --- | --- |
| Water per prompt, Google Gemini estimate | 3.0 mL, no matching source | 0.26 mL, on-site cooling water only, stated as a lower bound | Google's paper (arXiv 2508.15734). Power-plant water is not added: no sourced factor was verified. |
| Water per prompt, older estimate | 10 mL | 10 mL, marked as the low end of Li et al. and as including power-plant water | The two water figures use different boundaries and the page says so. |
| Grid carbon | 380 g/kWh, no year | 458 g/kWh (world, 2025) | Ember Global Electricity Review 2026 |
| Burger carbon | 3.6 kg, no source line | Two sourced figures shown side by side: 14.92 kg (beef herds, default) and 4.99 kg (dairy herds). No average. | Poore and Nemecek via Our World in Data. A selector on the page switches between them. |
| Burger water | 2,500 L | 2,310 L (15,400 L/kg x 0.15 kg) | Mekonnen and Hoekstra, same basis |
| Google electricity | 25.3, 31.8, 43.6 TWh | 24.99, 31.71, 43.59 TWh | Google 2026 Environmental Report |
| Data centre electricity | 340, 485, 960 TWh and a "75%" claim | 415 TWh (2024) and 945 TWh (2030) | IEA Energy and AI. The old figures and the 75% claim could not be verified and were removed. |

### Removed because no source could be found
- Burger energy (12 kWh), the power-plant water factor (1.8 L/kWh) and with it the streaming water figure, the training and hardware allowance, the 228 km3 livestock water figure and the 1.07 km3 AI data centre water figure, and the "whole world" comparison tab built on the last two. The reasons are listed in `removed_figures` in `data/benchmarks.json`. Old `tab=globalWater` links open the first tab.
- The page now says plainly what is not counted: training, chips, your device, the network, and power-plant water in Google's figure.

### Wording
- Labels name the study (Google Gemini median text prompt, 2025) instead of "recent, efficient AI", so they are not read as covering every chatbot or request type.
- Results say "greenhouse gases (CO2e)" instead of carbon dioxide. The answer no longer prints "<0.1%" and says it is not anyone's whole footprint.

### Second review round
- Water: no ratio, share or total puts AI water beside burger water. The AI figure is cooling water (Google) and the burger figure is a whole water footprint, mostly rain. The page explains this in plain words. The comparison tab is now greenhouse gases.
- AI greenhouse gases are labelled a scenario (Google's measured electricity times the world-average grid), not part of Google's measurement.
- 2.9 Wh per ChatGPT request now checked in the IEA Electricity 2024 report (page 34). 77 Wh per hour of video checked on the IEA commentary page (typical Netflix viewing, 2019, so not HD-specific; wording changed).
- Author-set ranges removed everywhere so none can be read as a confidence interval.
- Hero text now says AI uses electricity and can use water for cooling and for generating it.

### Known limits (stated on the page)
- Google's water figure is on-site cooling only (a lower bound). The older estimate includes power-plant water. They are not like for like.
- The 2.9 Wh figure is the IEA's number; the IEA does not give its basis in that passage.
- Only Chrome was tested. Safari, Firefox and real phones were not.

## [1.1.0] - 2026-11-22
- Decoupled constants and citations into `data/benchmarks.json`.
- Extracted calculation logic into `src/calculator.js` with Node.js unit tests.
- Added lifecycle toggle, URL state and JSON, CSV and PNG exports. Added CI and an issue template.
