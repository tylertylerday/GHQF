const STORAGE_KEY = "quickFilters";
const DEFAULT_ID_KEY = "defaultId";
const CONTAINER_ID = "qpf-container";
const MENU_HOST_ID = "qpf-menu-host";
const LOG_PREFIX = "[qpf]";

const DEFAULT_FILTERS = [
  { id: "no-drafts", label: "No drafts", query: "is:pr is:open draft:false", author: "" },
  { id: "ready-for-review", label: "Ready for review", query: "is:pr is:open draft:false review:none", author: "" },
  { id: "mine", label: "My PRs", query: "is:pr is:open", author: "@me" },
];

const MENU_CSS = `
  .menu {
    position: fixed;
    min-width: 240px;
    max-width: 360px;
    max-height: 400px;
    overflow-y: auto;
    padding: 4px 0;
    background: #ffffff;
    color: #1f2328;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(140, 149, 159, 0.2);
    pointer-events: auto;
    font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    .menu {
      background: #161b22;
      color: #e6edf3;
      border-color: #30363d;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
  }
  .menu[hidden] { display: none; }
  .item {
    display: block;
    padding: 6px 12px;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }
  .item:hover, .item:focus {
    background: rgba(140,149,159,0.18);
    outline: none;
  }
  .label { font-weight: 500; }
  .query {
    font-size: 11px;
    font-family: ui-monospace, "SFMono-Regular", "Cascadia Code", monospace;
    opacity: 0.7;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .empty {
    padding: 8px 12px;
    opacity: 0.7;
    font-size: 12px;
  }
`;

console.log(LOG_PREFIX, "content script loaded on", location.pathname);

function repoPullsBasePath() {
  const m = location.pathname.match(/^(\/[^/]+\/[^/]+\/pulls)(?:\/|$)/);
  return m ? m[1] : null;
}

function isRepoPullsPage() {
  const base = repoPullsBasePath();
  if (!base) return false;
  if (/\/pulls\/\d+(\/|$)/.test(location.pathname)) return false;
  return true;
}

function isBareRepoPullsPage() {
  return /^\/[^/]+\/[^/]+\/pulls\/?$/.test(location.pathname);
}

function effectiveQuery(filter) {
  const parts = [filter.query || ""];
  if (filter.author) parts.push(`author:${filter.author}`);
  return parts.join(" ").trim();
}

function buildUrl(filter) {
  const base = repoPullsBasePath() || location.pathname;
  return `${base}?q=${encodeURIComponent(effectiveQuery(filter))}`;
}

function maybeRedirectToDefault() {
  if (!isBareRepoPullsPage()) {
    console.log(LOG_PREFIX, "default: skip (not bare /pulls — pathname=", location.pathname, ")");
    return Promise.resolve(false);
  }
  if (location.search) {
    console.log(LOG_PREFIX, "default: skip (URL already has search:", location.search, ")");
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      { [STORAGE_KEY]: DEFAULT_FILTERS, [DEFAULT_ID_KEY]: null },
      (items) => {
        const id = items[DEFAULT_ID_KEY];
        console.log(LOG_PREFIX, "default: storage defaultId=", id);
        if (!id) {
          console.log(LOG_PREFIX, "default: no default set");
          return resolve(false);
        }
        const filter = items[STORAGE_KEY].find((f) => f.id === id);
        if (!filter) {
          console.log(LOG_PREFIX, "default: filter id not found", id);
          return resolve(false);
        }
        const target = buildUrl(filter);
        if (target === location.pathname + location.search) {
          console.log(LOG_PREFIX, "default: already at target");
          return resolve(false);
        }
        console.log(LOG_PREFIX, "default: redirecting to", target, "for filter", filter.label);
        location.replace(target);
        resolve(true);
      }
    );
  });
}

function findLabelsAnchor() {
  const labelsLink = document.querySelector('a[href$="/labels"]');
  if (labelsLink) return labelsLink;
  for (const d of document.querySelectorAll("details")) {
    const summary = d.querySelector("summary");
    if (summary && /^\s*Labels\b/i.test(summary.textContent || "")) return d;
  }
  const search = document.querySelector('input[name="q"]');
  if (search) {
    let scope = search.parentElement;
    for (let i = 0; i < 8 && scope; i++) {
      for (const el of scope.querySelectorAll("a, button, summary")) {
        const text = (el.textContent || "").trim();
        if (/^Labels(\s|$)/i.test(text)) {
          return el.closest("a, button, details") || el;
        }
      }
      scope = scope.parentElement;
    }
  }
  return null;
}

function ensureMenuShadow() {
  let host = document.getElementById(MENU_HOST_ID);
  if (host && host.shadowRoot) return host.shadowRoot;
  if (host) host.remove();

  host = document.createElement("div");
  host.id = MENU_HOST_ID;
  host.style.cssText = "position: fixed; top: 0; left: 0; width: 0; height: 0; pointer-events: none; z-index: 2147483647;";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = MENU_CSS;
  shadow.appendChild(style);
  return shadow;
}

function buildMenu(filters) {
  const shadow = ensureMenuShadow();
  const old = shadow.querySelector(".menu");
  if (old) old.remove();

  const menu = document.createElement("div");
  menu.className = "menu";
  menu.hidden = true;

  if (filters.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No filters yet — add some from the extension popup.";
    menu.appendChild(empty);
  } else {
    for (const f of filters) {
      const item = document.createElement("a");
      item.className = "item";
      item.href = buildUrl(f);
      const lbl = document.createElement("div");
      lbl.className = "label";
      lbl.textContent = f.label;
      const q = document.createElement("div");
      q.className = "query";
      q.textContent = effectiveQuery(f);
      item.append(lbl, q);
      menu.appendChild(item);
    }
  }

  shadow.appendChild(menu);
  return menu;
}

function positionMenu(menu, trigger) {
  const r = trigger.getBoundingClientRect();
  menu.style.top = `${Math.round(r.bottom + 4)}px`;
  menu.style.left = `${Math.round(r.left)}px`;
}

function renderTrigger(filters, anchor) {
  if (!anchor.isConnected || !anchor.parentNode) {
    console.log(LOG_PREFIX, "render: anchor went stale, will retry");
    scheduleInject();
    return;
  }

  const existing = document.getElementById(CONTAINER_ID);
  if (existing) existing.remove();

  const wrapper = document.createElement("span");
  wrapper.id = CONTAINER_ID;
  wrapper.style.cssText = "display: inline-block; margin-right: 8px; vertical-align: middle;";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-sm";
  button.setAttribute("aria-haspopup", "true");
  button.setAttribute("aria-expanded", "false");
  button.style.whiteSpace = "nowrap";
  button.append(document.createTextNode("Quick filters "));
  const caret = document.createElement("span");
  caret.textContent = "▾";
  caret.style.cssText = "font-size: 9px; margin-left: 4px; opacity: 0.7;";
  button.appendChild(caret);

  const menu = buildMenu(filters);

  let open = false;
  function setOpen(val) {
    open = val;
    menu.hidden = !val;
    button.setAttribute("aria-expanded", String(val));
    if (val) positionMenu(menu, button);
  }

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  });

  document.addEventListener("click", (e) => {
    if (!open) return;
    if (button.contains(e.target)) return;
    if (e.target && e.target.id === MENU_HOST_ID) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (open && e.key === "Escape") setOpen(false);
  });

  window.addEventListener("scroll", () => { if (open) positionMenu(menu, button); }, true);
  window.addEventListener("resize", () => { if (open) positionMenu(menu, button); });

  wrapper.appendChild(button);
  anchor.parentNode.insertBefore(wrapper, anchor);
  console.log(LOG_PREFIX, "injected dropdown trigger before", anchor);
}

function inject() {
  if (!isRepoPullsPage()) return;
  if (document.getElementById(CONTAINER_ID)) return;
  const anchor = findLabelsAnchor();
  if (!anchor) return;
  console.log(LOG_PREFIX, "inject: anchor found, fetching filters");
  chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_FILTERS }, (items) => {
    renderTrigger(items[STORAGE_KEY], anchor);
  });
}

let observer = null;
let pendingInject = false;
function scheduleInject() {
  if (pendingInject) return;
  pendingInject = true;
  requestAnimationFrame(() => {
    pendingInject = false;
    inject();
  });
}

function startWatching() {
  if (observer) return;
  observer = new MutationObserver(scheduleInject);
  observer.observe(document.body, { childList: true, subtree: true });
}

async function start(reason) {
  console.log(LOG_PREFIX, "start:", reason || "init", "url=", location.pathname + location.search);
  const redirected = await maybeRedirectToDefault();
  if (redirected) return;
  inject();
  startWatching();
}

start();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if (changes[STORAGE_KEY]) {
    const existing = document.getElementById(CONTAINER_ID);
    if (existing) existing.remove();
    inject();
  }
});

document.addEventListener("turbo:render", () => start("turbo:render"));
document.addEventListener("turbo:load", () => start("turbo:load"));
document.addEventListener("pjax:end", () => start("pjax:end"));
