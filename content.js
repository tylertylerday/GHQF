const STORAGE_KEY = "quickFilters";
const DEFAULT_ID_KEY = "defaultId";
const CONTAINER_ID = "qpf-container";
const MENU_HOST_ID = "qpf-menu-host";
const SIDEBAR_ID = "qpf-sidebar-group";
const DIALOG_HOST_ID = "qpf-dialog-host";
const NATIVE_SIDEBAR_LABELS = ["Authored by me", "Assigned to me", "Involves me", "Review requests"];

const ICON_FILTER = '<path d="M.75 3h14.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5ZM3 7.75A.75.75 0 0 1 3.75 7h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 7.75Zm3 4a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path>';
const ICON_STAR = '<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>';
const ICON_STAR_FILL = '<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>';
const ICON_TRASH = '<path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path>';

// Row action buttons (star / trash). Lives in the page, scoped to our group.
const SIDEBAR_CSS = `
  #qpf-sidebar-group .qpf-row { position: relative; }
  #qpf-sidebar-group .qpf-link { padding-right: 56px !important; }
  #qpf-sidebar-group .qpf-link.qpf-active {
    position: relative;
    font-weight: 600;
    background: var(--control-transparent-bgColor-selected, rgba(129,139,152,0.15));
  }
  #qpf-sidebar-group .qpf-link.qpf-active::after {
    content: "";
    position: absolute;
    top: calc(50% - 12px);
    left: -8px;
    width: 4px;
    height: 24px;
    border-radius: 6px;
    background: var(--fgColor-accent, #4493f8);
  }
  #qpf-sidebar-group .qpf-actions {
    position: absolute; top: 50%; right: 6px; transform: translateY(-50%);
    display: flex; gap: 2px; align-items: center;
    z-index: 2; pointer-events: auto;
  }
  #qpf-sidebar-group .qpf-action {
    display: inline-flex; align-items: center; justify-content: center;
    width: 24px; height: 24px; padding: 0; border: 0; border-radius: 6px;
    background: transparent; cursor: pointer;
    color: var(--fgColor-muted, #59636e);
    opacity: 0; transition: opacity 80ms;
  }
  #qpf-sidebar-group .qpf-action svg { fill: currentColor; }
  #qpf-sidebar-group .qpf-row:hover .qpf-action,
  #qpf-sidebar-group .qpf-row:focus-within .qpf-action,
  #qpf-sidebar-group .qpf-action.is-default { opacity: 1; }
  #qpf-sidebar-group .qpf-action:hover { background: var(--control-transparent-bgColor-hover, rgba(129,139,152,0.15)); }
  #qpf-sidebar-group .qpf-action.is-default { color: var(--fgColor-attention, #d29922); }
  #qpf-sidebar-group .qpf-action.qpf-trash:hover { color: var(--fgColor-danger, #f85149); }
`;

const ICON_PLUS = '<path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"></path>';

// Shadow DOM inherits CSS custom properties, so GitHub's Primer tokens
// (with fallbacks) keep the dialog matching the active light/dark theme.
const DIALOG_CSS = `
  dialog {
    width: min(440px, calc(100vw - 32px));
    padding: 0;
    border: 1px solid var(--borderColor-default, #d0d7de);
    border-radius: 12px;
    background: var(--overlay-bgColor, var(--bgColor-default, #ffffff));
    color: var(--fgColor-default, #1f2328);
    box-shadow: var(--shadow-floating-large, 0 8px 24px rgba(0,0,0,0.3));
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  }
  dialog::backdrop { background: var(--overlay-backdrop-bgColor, rgba(0,0,0,0.4)); }
  header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--borderColor-muted, #d8dee4);
  }
  h2 { margin: 0; font-size: 14px; font-weight: 600; }
  .close {
    border: 0; background: transparent; color: var(--fgColor-muted, #59636e);
    font-size: 18px; line-height: 1; cursor: pointer; padding: 4px 8px; border-radius: 6px;
  }
  .close:hover { background: var(--control-transparent-bgColor-hover, rgba(129,139,152,0.15)); }
  form { padding: 16px; display: grid; gap: 12px; }
  label { display: grid; gap: 4px; font-weight: 600; font-size: 14px; }
  .optional, .hint { font-weight: 400; color: var(--fgColor-muted, #59636e); font-size: 12px; }
  input {
    font: inherit; font-weight: 400;
    padding: 5px 12px;
    border: 1px solid var(--control-borderColor-rest, var(--borderColor-default, #d0d7de));
    border-radius: 6px;
    background: var(--bgColor-default, #ffffff);
    color: inherit;
  }
  input:focus { outline: 2px solid var(--focus-outlineColor, #0969da); outline-offset: -1px; }
  input.mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; font-size: 12px; }
  .row { display: flex; align-items: center; gap: 8px; font-weight: 400; }
  footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
  button.btn {
    font: inherit; font-size: 14px; font-weight: 500;
    padding: 5px 16px; border-radius: 6px; cursor: pointer;
    border: 1px solid var(--button-default-borderColor-rest, var(--borderColor-default, #d0d7de));
    background: var(--button-default-bgColor-rest, #f6f8fa);
    color: var(--button-default-fgColor-rest, inherit);
  }
  button.btn:hover { background: var(--button-default-bgColor-hover, #eff2f5); }
  button.primary {
    border-color: var(--button-primary-borderColor-rest, rgba(31,35,40,0.15));
    background: var(--button-primary-bgColor-rest, #1f883d);
    color: var(--button-primary-fgColor-rest, #ffffff);
  }
  button.primary:hover { background: var(--button-primary-bgColor-hover, #1c8139); }
`;
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

// ---- New-UI sidebar integration -------------------------------------------

function currentQuery() {
  return new URLSearchParams(location.search).get("q") || "";
}

// GitHub rewrites some qualifiers (e.g. is:open -> state:open), so compare
// queries as an unordered, de-duplicated set of canonical tokens.
function normalizeQuery(q) {
  const tokens = q
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/^is:(open|closed|merged)$/, "state:$1"));
  return [...new Set(tokens)].sort().join(" ");
}

// Returns the deepest element whose own text is exactly `text`.
function findTextNodeElement(root, text) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue.trim() === text) return node.parentElement;
  }
  return null;
}

// Locate the "Authored by me / ... / Review requests" group GitHub renders in
// the left sidebar. We clone one of its rows so our items pick up whatever
// markup and classes GitHub currently uses.
function findNativeSidebarItem() {
  const matches = [];
  for (const a of document.querySelectorAll("a[href]")) {
    // Skip PR title links (e.g. a PR literally named "Review requests ...").
    if (/\/pulls?\/\d+/.test(a.getAttribute("href"))) continue;
    const text = (a.textContent || "").trim();
    if (NATIVE_SIDEBAR_LABELS.some((l) => text === l || text.startsWith(l))) matches.push(a);
  }
  if (matches.length === 0) return null;
  const link = matches[matches.length - 1];
  if (link.closest(`#${SIDEBAR_ID}`)) return null;
  const item = link.closest("li") || link;
  const label = NATIVE_SIDEBAR_LABELS.find((l) => (link.textContent || "").trim().startsWith(l));
  return { item, link, label, active: findNativeActiveItem(item) };
}

function firstLabelText(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement.closest("svg")) continue;
    const t = node.nodeValue.trim();
    if (t) return t;
  }
  return null;
}

// GitHub's currently-selected sidebar row (e.g. "Pull requests"). Cloning it
// for our active row reuses whatever classes/attributes GitHub uses for the
// selected look, instead of guessing at them.
function findNativeActiveItem(nativeItem) {
  const scope = nativeItem.closest("nav") || nativeItem.parentElement?.parentElement || document;
  const sel = 'a[aria-current]:not([aria-current="false"]), [data-active="true"] a, a[data-active="true"]';
  for (const link of scope.querySelectorAll(sel)) {
    if (link.closest(`#${SIDEBAR_ID}`)) continue;
    const item = link.closest("li") || link;
    const label = firstLabelText(link);
    if (label) return { item, link, label };
  }
  return null;
}

function makeSidebarRow(native, { text, href, icon, active, title }) {
  // Active rows are cloned from GitHub's own selected row when one exists.
  const template = active && native.active ? native.active : native;
  const keepActiveAttrs = template === native.active;
  const row = template.item.cloneNode(true);
  row.removeAttribute("id");
  for (const el of [row, ...row.querySelectorAll("*")]) {
    el.removeAttribute("id");
    if (!keepActiveAttrs) {
      el.removeAttribute("aria-current");
      el.removeAttribute("data-active");
      el.removeAttribute("aria-selected");
    }
    el.removeAttribute("aria-labelledby");
    el.removeAttribute("aria-describedby");
    el.removeAttribute("data-hotkey");
  }
  const link = row.tagName === "A" ? row : row.querySelector("a");
  const textEl = findTextNodeElement(row, template.label);
  if (textEl) textEl.textContent = text;
  else if (link) link.textContent = text;

  const svg = row.querySelector("svg");
  if (svg) {
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.innerHTML = icon;
  }
  if (link) {
    link.classList.add("qpf-link");
    link.href = href;
    if (title) link.title = title;
    if (active) {
      link.setAttribute("aria-current", "page");
      // No native selected row to copy from: fall back to our own styling.
      if (!keepActiveAttrs) link.classList.add("qpf-active");
    }
  }
  return { row, link };
}

function svgIcon(paths) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = paths;
  return svg;
}

function actionButton(className, label, icon) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `qpf-action ${className}`;
  b.setAttribute("aria-label", label);
  b.title = label;
  b.appendChild(svgIcon(icon));
  return b;
}

function updateStorage(mutator) {
  chrome.storage.sync.get(
    { [STORAGE_KEY]: DEFAULT_FILTERS, [DEFAULT_ID_KEY]: null },
    (items) => {
      const next = mutator({ filters: items[STORAGE_KEY], defaultId: items[DEFAULT_ID_KEY] });
      // storage.onChanged re-renders the sidebar.
      chrome.storage.sync.set({ [STORAGE_KEY]: next.filters, [DEFAULT_ID_KEY]: next.defaultId });
    }
  );
}

const TOAST_HOST_ID = "qpf-toast-host";

function showUndoToast(message, onUndo) {
  const old = document.getElementById(TOAST_HOST_ID);
  if (old) old.remove();
  const host = document.createElement("div");
  host.id = TOAST_HOST_ID;
  host.style.cssText = "position: fixed; left: 16px; bottom: 16px; z-index: 2147483647;";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      .toast {
        display: flex; align-items: center; gap: 16px;
        padding: 10px 12px 10px 16px; border-radius: 6px;
        background: var(--bgColor-emphasis, #25292e); color: var(--fgColor-onEmphasis, #ffffff);
        box-shadow: var(--shadow-floating-large, 0 8px 24px rgba(0,0,0,0.3));
        font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      }
      button {
        font: inherit; font-weight: 600; border: 0; background: transparent; cursor: pointer;
        color: var(--fgColor-accent, #4493f8); padding: 2px 6px; border-radius: 6px;
      }
      button:hover { background: rgba(255,255,255,0.1); }
    </style>
    <div class="toast" role="status"><span></span><button type="button">Undo</button></div>
  `;
  shadow.querySelector("span").textContent = message;
  const timer = setTimeout(() => host.remove(), 6000);
  shadow.querySelector("button").addEventListener("click", () => {
    clearTimeout(timer);
    host.remove();
    onUndo();
  });
  document.body.appendChild(host);
}

function deleteFilter(id) {
  chrome.storage.sync.get(
    { [STORAGE_KEY]: DEFAULT_FILTERS, [DEFAULT_ID_KEY]: null },
    (items) => {
      const filters = items[STORAGE_KEY];
      const defaultId = items[DEFAULT_ID_KEY];
      const index = filters.findIndex((f) => f.id === id);
      if (index === -1) {
        console.log(LOG_PREFIX, "delete: filter not found", id);
        return;
      }
      const removed = filters[index];
      const wasDefault = defaultId === id;
      chrome.storage.sync.set(
        {
          [STORAGE_KEY]: filters.filter((f) => f.id !== id),
          [DEFAULT_ID_KEY]: wasDefault ? null : defaultId,
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(LOG_PREFIX, "delete failed:", chrome.runtime.lastError);
            return;
          }
          console.log(LOG_PREFIX, "deleted filter", removed.label);
          showUndoToast(`Deleted “${removed.label}”`, () => {
            updateStorage(({ filters: cur, defaultId: curDefault }) => {
              const next = cur.slice();
              next.splice(Math.min(index, next.length), 0, removed);
              return { filters: next, defaultId: wasDefault ? removed.id : curDefault };
            });
          });
        }
      );
    }
  );
}

function addRowActions(row, filter, isDefault) {
  row.classList.add("qpf-row");
  const actions = document.createElement("span");
  actions.className = "qpf-actions";

  const star = actionButton(
    "qpf-star" + (isDefault ? " is-default" : ""),
    isDefault ? `Default filter — click to unset` : `Open “${filter.label}” by default`,
    isDefault ? ICON_STAR_FILL : ICON_STAR
  );
  star.setAttribute("aria-pressed", String(isDefault));
  star.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateStorage(({ filters, defaultId }) => ({
      filters,
      defaultId: defaultId === filter.id ? null : filter.id,
    }));
  });

  const trash = actionButton("qpf-trash", `Delete “${filter.label}”`, ICON_TRASH);
  trash.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(LOG_PREFIX, "trash clicked for", filter.label);
    deleteFilter(filter.id);
  });

  actions.append(star, trash);
  row.appendChild(actions);
}

function injectSidebar(filters, native, defaultId) {
  const existing = document.getElementById(SIDEBAR_ID);
  if (existing) existing.remove();

  const list = native.item.parentElement;
  if (!list || !list.parentNode) return false;

  const group = document.createElement("div");
  group.id = SIDEBAR_ID;
  const style = document.createElement("style");
  style.textContent = SIDEBAR_CSS;
  group.appendChild(style);

  const divider = document.createElement("div");
  divider.setAttribute("role", "separator");
  divider.style.cssText = "height: 1px; margin: 8px 8px; background: var(--borderColor-muted, rgba(128,128,128,0.25));";

  const heading = document.createElement("div");
  heading.textContent = "Quick filters";
  heading.style.cssText = "padding: 6px 8px 4px; font-size: 12px; font-weight: 600; color: var(--fgColor-muted, #59636e);";

  // Keep the same container element type (usually <ul>) so list styling applies.
  const itemsList = list.cloneNode(false);
  itemsList.removeAttribute("id");
  itemsList.removeAttribute("aria-labelledby");
  itemsList.setAttribute("aria-label", "Quick filters");

  const q = normalizeQuery(currentQuery());
  for (const f of filters) {
    let { row } = makeSidebarRow(native, {
      text: f.label,
      href: buildUrl(f),
      icon: ICON_FILTER,
      active: q && normalizeQuery(effectiveQuery(f)) === q,
      title: effectiveQuery(f),
    });
    // Buttons can't live inside an <a>; wrap bare-anchor rows.
    if (row.tagName === "A") {
      const wrap = document.createElement("div");
      wrap.appendChild(row);
      row = wrap;
    }
    addRowActions(row, f, f.id === defaultId);
    itemsList.appendChild(row);
  }

  const { row: newRow, link: newLink } = makeSidebarRow(native, {
    text: "New filter",
    href: "#",
    icon: ICON_PLUS,
    title: "Create a quick filter (pre-filled with the current search)",
  });
  if (newLink) {
    newLink.setAttribute("role", "button");
    newLink.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openNewFilterDialog();
    });
  }
  itemsList.appendChild(newRow);

  group.append(divider, heading, itemsList);
  list.parentNode.insertBefore(group, list.nextSibling);
  console.log(LOG_PREFIX, "injected sidebar group; native active row:", native.active ? native.active.label : "none (using fallback style)");
  return true;
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "f-" + Math.random().toString(36).slice(2, 10);
}

function openNewFilterDialog() {
  let host = document.getElementById(DIALOG_HOST_ID);
  if (host) host.remove();
  host = document.createElement("div");
  host.id = DIALOG_HOST_ID;
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = DIALOG_CSS;

  const dialog = document.createElement("dialog");
  dialog.setAttribute("aria-labelledby", "qpf-title");
  dialog.innerHTML = `
    <header>
      <h2 id="qpf-title">New quick filter</h2>
      <button type="button" class="close" aria-label="Close">×</button>
    </header>
    <form method="dialog" autocomplete="off">
      <label>Name
        <input name="label" type="text" required maxlength="40" placeholder="No drafts" />
      </label>
      <label>Query
        <input name="query" class="mono" type="text" required placeholder="is:pr is:open draft:false" />
        <span class="hint">Pre-filled with the current search.</span>
      </label>
      <label>Author <span class="optional">(optional)</span>
        <input name="author" type="text" placeholder="octocat or @me" />
      </label>
      <label class="row"><input name="default" type="checkbox" /> Open this filter by default</label>
      <footer>
        <button type="button" class="btn cancel">Cancel</button>
        <button type="submit" class="btn primary">Create filter</button>
      </footer>
    </form>
  `;
  shadow.append(style, dialog);

  const form = dialog.querySelector("form");
  form.elements.query.value = currentQuery() || "is:pr is:open";

  const close = () => { dialog.close(); host.remove(); };
  dialog.querySelector(".close").addEventListener("click", close);
  dialog.querySelector(".cancel").addEventListener("click", close);
  dialog.addEventListener("cancel", () => host.remove());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });
  // Stop GitHub's global hotkeys from firing while typing in the dialog.
  dialog.addEventListener("keydown", (e) => { if (e.key !== "Escape") e.stopPropagation(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const label = form.elements.label.value.trim();
    const query = form.elements.query.value.trim();
    const author = form.elements.author.value.trim().replace(/^author:/, "");
    if (!label || !query) return;
    const makeDefault = form.elements.default.checked;
    chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_FILTERS }, (items) => {
      const filter = { id: makeId(), label, query, author };
      const update = { [STORAGE_KEY]: [...items[STORAGE_KEY], filter] };
      if (makeDefault) update[DEFAULT_ID_KEY] = filter.id;
      chrome.storage.sync.set(update, () => {
        close();
        location.assign(buildUrl(filter));
      });
    });
  });

  dialog.showModal();
  form.elements.label.focus();
}

// ---- Legacy UI: dropdown button next to "Labels" -------------------------

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
  if (document.getElementById(SIDEBAR_ID) || document.getElementById(CONTAINER_ID)) return;

  const native = findNativeSidebarItem();
  if (native) {
    chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_FILTERS, [DEFAULT_ID_KEY]: null }, (items) => {
      if (document.getElementById(SIDEBAR_ID)) return;
      if (!native.item.isConnected) return scheduleInject();
      injectSidebar(items[STORAGE_KEY], native, items[DEFAULT_ID_KEY]);
    });
    return;
  }

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
  if (changes[STORAGE_KEY] || changes[DEFAULT_ID_KEY]) {
    for (const id of [CONTAINER_ID, SIDEBAR_ID]) {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    }
    inject();
  }
});

document.addEventListener("turbo:render", () => start("turbo:render"));
document.addEventListener("turbo:load", () => start("turbo:load"));
document.addEventListener("pjax:end", () => start("pjax:end"));
