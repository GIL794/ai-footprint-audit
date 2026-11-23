# Browser checks (optional, need Google Chrome)

These drive a real Chrome with ordinary keyboard events. They are not part of CI.

```bash
python3 -m http.server 8765 &      # from the repository root
node tests/browser/interaction.mjs # typing decimals, bad links, tabs, exports, share button
node tests/browser/layout.mjs      # file:// mode, 320/390/1280 widths, touch targets, tab order
```
Each line starts with PASS or FAIL. Screenshots go to /tmp/ai-footprint-out.
