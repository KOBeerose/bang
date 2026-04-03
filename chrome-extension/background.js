const BANGS = [
  { triggers: ["g", "google"], service: "Google", urlTemplate: "https://www.google.com/search?q=%s" },
  { triggers: ["gh", "github"], service: "GitHub", urlTemplate: "https://github.com/search?q=%s" },
  { triggers: ["yt", "youtube"], service: "YouTube", urlTemplate: "https://www.youtube.com/results?search_query=%s" },
  { triggers: ["w", "wiki", "wikipedia"], service: "Wikipedia", urlTemplate: "https://en.wikipedia.org/wiki/Special:Search?search=%s" },
  { triggers: ["r", "reddit"], service: "Reddit", urlTemplate: "https://www.reddit.com/search/?q=%s" },
  { triggers: ["so", "stackoverflow"], service: "Stack Overflow", urlTemplate: "https://stackoverflow.com/search?q=%s" },
  { triggers: ["mdn"], service: "MDN", urlTemplate: "https://developer.mozilla.org/en-US/search?q=%s" },
  { triggers: ["npm"], service: "npm", urlTemplate: "https://www.npmjs.com/search?q=%s" },
  { triggers: ["amz", "amazon"], service: "Amazon", urlTemplate: "https://www.amazon.com/s?k=%s" },
  { triggers: ["x", "twitter"], service: "X", urlTemplate: "https://x.com/search?q=%s" }
];

const BANG_MAP = new Map();
for (const bang of BANGS) {
  for (const trigger of bang.triggers) {
    BANG_MAP.set(trigger.toLowerCase(), bang);
  }
}

function parseInput(rawText) {
  const trimmed = (rawText || "").trim();
  if (!trimmed) return null;

  const normalized = trimmed.startsWith("!") ? trimmed.slice(1).trimStart() : trimmed;
  if (!normalized) return null;

  const [trigger, ...rest] = normalized.split(/\s+/);
  return {
    trigger: trigger.toLowerCase(),
    query: rest.join(" ").trim()
  };
}

function buildBangUrl(bang, query) {
  const encoded = encodeURIComponent(query || "");
  return bang.urlTemplate.includes("%s")
    ? bang.urlTemplate.replaceAll("%s", encoded)
    : `${bang.urlTemplate}${encoded}`;
}

function dispositionToSearchDisposition(disposition) {
  switch (disposition) {
    case "newForegroundTab":
      return "NEW_FOREGROUND_TAB";
    case "newBackgroundTab":
      return "NEW_BACKGROUND_TAB";
    default:
      return "CURRENT_TAB";
  }
}

function openUrlForDisposition(url, disposition) {
  if (disposition === "newForegroundTab") {
    chrome.tabs.create({ url, active: true });
    return;
  }

  if (disposition === "newBackgroundTab") {
    chrome.tabs.create({ url, active: false });
    return;
  }

  chrome.tabs.update({ url });
}

function runDefaultSearch(text, disposition) {
  const query = (text || "").trim();
  if (!query) return;

  chrome.search.query({
    text: query,
    disposition: dispositionToSearchDisposition(disposition)
  });
}

chrome.omnibox.onInputStarted.addListener(() => {
  chrome.omnibox.setDefaultSuggestion({
    description: "Type a bang and query, e.g. <match>g cats</match> or <match>!g cats</match>"
  });
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  const normalized = (text || "").trim().replace(/^!/, "");
  const [triggerPrefix = "", ...rest] = normalized.split(/\s+/);
  const query = rest.join(" ").trim();
  const prefix = triggerPrefix.toLowerCase();

  if (!prefix) {
    suggest([]);
    return;
  }

  const suggestions = [];
  for (const bang of BANGS) {
    const trigger = bang.triggers.find((t) => t.startsWith(prefix));
    if (!trigger) continue;

    const content = `${trigger} ${query}`.trim();
    suggestions.push({
      content,
      description: `<match>${trigger}</match> → ${bang.service}`
    });

    if (suggestions.length >= 6) break;
  }

  suggest(suggestions);
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  const parsed = parseInput(text);
  if (!parsed) {
    runDefaultSearch(text, disposition);
    return;
  }

  const bang = BANG_MAP.get(parsed.trigger);
  if (!bang) {
    runDefaultSearch(text, disposition);
    return;
  }

  const targetUrl = buildBangUrl(bang, parsed.query);
  openUrlForDisposition(targetUrl, disposition);
});
