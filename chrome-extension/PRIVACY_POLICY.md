# Privacy Policy – ReBang Omnibox Redirect

Last updated: 2026-04-03

ReBang Omnibox Redirect does not collect, store, transmit, or sell personal data.

## What the extension does
- The extension only reacts when you intentionally enter Chrome omnibox keyword mode with `!` and press `Tab`.
- It parses your entered text locally in the browser.
- If the first token matches a built-in hardcoded bang trigger, it redirects your tab to that website's search URL.
- If no built-in trigger matches, it sends the same text to Chrome's default search engine through the `chrome.search` API.

## Data handling
- No account system
- No analytics
- No tracking pixels
- No remote code execution
- No server-side logging by this extension
- No use of `storage`, `cookies`, `history`, `tabs` (read), or host permissions

## Permissions used
- `search`: used only to pass non-bang text to your configured default search engine.

## Contact
For questions, open an issue in this repository.
