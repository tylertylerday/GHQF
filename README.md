# GHQF — GitHub PR Quick Filters

A small Chrome/Firefox extension that adds a **Quick filters** dropdown to a GitHub repository's Pull Requests page. Save your common search queries (no drafts, ready for review, my PRs, etc.) and apply them with one click. Optionally mark one as **default** so visiting `/owner/repo/pulls` automatically applies it.

## Features

- Dropdown of quick filters injected next to the Labels/Milestones buttons on `/owner/repo/pulls`.
- Each filter has a label, a GitHub search query (`is:pr is:open draft:false`, etc.), and an optional **author** field that's appended as `author:<value>`.
- A **default** filter automatically redirects bare `/owner/repo/pulls` visits to the filter's URL.
- Filters sync across browsers via `chrome.storage.sync`.

## Install

### Firefox (signed)
Coming soon to addons.mozilla.org.

### Chrome / Edge (unpacked, for development)
1. Clone or download this repo.
2. Visit `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and pick this folder.

### Firefox (temporary, for development)
1. Visit `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on**, and pick `manifest.json`. Resets on restart.

## Use

- Click the extension's icon in your browser toolbar to open the **Quick Filters** popup. Add, remove, reorder, or mark filters as default there.
- On any GitHub repo's Pull Requests tab, click **Quick filters** between the search bar and Labels to pick a filter.

## Development

The extension is plain JS — no build step.

```
manifest.json    # MV3 manifest, matches /*/*/pulls*
content.js       # Injects the dropdown trigger; menu lives in a Shadow DOM in document.body
popup.html/.js/.css   # Settings popup
icons/           # 16/48/128 PNG icons
```

## License

MIT — see [LICENSE](LICENSE).
