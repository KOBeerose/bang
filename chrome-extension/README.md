# ReBang Omnibox Redirect (Chrome Extension)

This extension provides client-side `!bang` redirects without replacing your default search engine.

## How it works
1. Type `!` in the address bar, then press `Tab` to enter extension keyword mode.
2. Type a bang and optional query:
   - `g cats`
   - `gh rebang`
   - `yt lo-fi`
3. Matching bangs redirect directly to their target websites.
4. If no bang matches, your text is sent to your default search engine.

## Local install (unpacked)
1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `chrome-extension`.

## Hardcoded bangs
The extension intentionally uses a hardcoded list and does not fetch a remote bang database.
