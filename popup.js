const STORAGE_KEY = "quickFilters";
const DEFAULT_ID_KEY = "defaultId";

const DEFAULT_FILTERS = [
  { id: "no-drafts", label: "No drafts", query: "is:pr is:open draft:false", author: "" },
  { id: "ready-for-review", label: "Ready for review", query: "is:pr is:open draft:false review:none", author: "" },
  { id: "mine", label: "My PRs", query: "is:pr is:open", author: "@me" },
];

const listEl = document.getElementById("filter-list");
const form = document.getElementById("add-form");
const labelInput = document.getElementById("label-input");
const queryInput = document.getElementById("query-input");
const authorInput = document.getElementById("author-input");
const resetBtn = document.getElementById("reset-btn");

function load() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      { [STORAGE_KEY]: DEFAULT_FILTERS, [DEFAULT_ID_KEY]: null },
      (items) => {
        resolve({ filters: items[STORAGE_KEY], defaultId: items[DEFAULT_ID_KEY] });
      }
    );
  });
}

function save(filters) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: filters }, resolve);
  });
}

function saveDefaultId(id) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [DEFAULT_ID_KEY]: id }, resolve);
  });
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "f-" + Math.random().toString(36).slice(2, 10);
}

function row(filter, index, total, defaultId) {
  const li = document.createElement("li");
  li.className = "filter-row";

  const text = document.createElement("div");
  text.className = "filter-text";
  const label = document.createElement("strong");
  label.textContent = filter.label;
  const queryParts = [filter.query || ""];
  if (filter.author) queryParts.push(`author:${filter.author}`);
  const query = document.createElement("code");
  query.textContent = queryParts.join(" ").trim();
  text.append(label, query);

  const controls = document.createElement("div");
  controls.className = "filter-controls";

  const isDefault = filter.id === defaultId;
  const def = document.createElement("button");
  def.type = "button";
  def.className = "default-btn" + (isDefault ? " active" : "");
  def.title = isDefault
    ? "This filter is applied automatically when you visit the PR list. Click to unset."
    : "Apply this filter automatically when visiting the PR list.";
  def.textContent = "Default";
  def.addEventListener("click", () => toggleDefault(filter.id));
  controls.appendChild(def);

  const up = document.createElement("button");
  up.type = "button";
  up.className = "icon";
  up.title = "Move up";
  up.textContent = "↑";
  up.disabled = index === 0;
  up.addEventListener("click", () => move(index, -1));

  const down = document.createElement("button");
  down.type = "button";
  down.className = "icon";
  down.title = "Move down";
  down.textContent = "↓";
  down.disabled = index === total - 1;
  down.addEventListener("click", () => move(index, 1));

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "icon danger";
  remove.title = "Remove";
  remove.textContent = "×";
  remove.addEventListener("click", () => removeAt(index));

  controls.append(up, down, remove);
  li.append(text, controls);
  return li;
}

async function render() {
  const { filters, defaultId } = await load();
  listEl.innerHTML = "";
  if (filters.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No filters yet.";
    listEl.appendChild(empty);
    return;
  }
  filters.forEach((f, i) => listEl.appendChild(row(f, i, filters.length, defaultId)));
}

async function move(index, delta) {
  const { filters } = await load();
  const target = index + delta;
  if (target < 0 || target >= filters.length) return;
  const next = filters.slice();
  [next[index], next[target]] = [next[target], next[index]];
  await save(next);
  render();
}

async function removeAt(index) {
  const { filters, defaultId } = await load();
  const removed = filters[index];
  const next = filters.filter((_, i) => i !== index);
  await save(next);
  if (removed && removed.id === defaultId) await saveDefaultId(null);
  render();
}

async function toggleDefault(id) {
  const { defaultId } = await load();
  await saveDefaultId(defaultId === id ? null : id);
  render();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const label = labelInput.value.trim();
  const query = queryInput.value.trim();
  const author = authorInput.value.trim();
  if (!label || !query) return;
  const { filters } = await load();
  const next = [...filters, { id: makeId(), label, query, author }];
  await save(next);
  labelInput.value = "";
  queryInput.value = "";
  authorInput.value = "";
  render();
});

resetBtn.addEventListener("click", async () => {
  await save(DEFAULT_FILTERS);
  await saveDefaultId(null);
  render();
});

render();
