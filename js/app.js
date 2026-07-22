import { calculatePrimary, optimizeLoot, calculateSummary, money } from './calculator-core.js';

const STORAGE_KEY = 'kortz-center-calculator:v3';
const UI_VERSION = '6.12.0';
const state = { data: null, imageManifest: null };

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function elementValue(selector) {
  const element = $(selector);
  if (!element) {
    throw new Error(`Interface files are out of sync: missing ${selector}`);
  }
  return element.value;
}

const boolValue = (selector) => elementValue(selector) === 'true';

function hasKnownItemValue(item) {
  return typeof item?.value === 'number' && Number.isFinite(item.value);
}

function itemValueLabel(item) {
  return hasKnownItemValue(item) ? money(item.value) : 'Enter Raf value';
}


function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSecondaryImageEntry(id) {
  return state.imageManifest?.secondaryTargets?.[id] || null;
}

function hasApprovedImage(entry) {
  return Boolean(entry && entry.image && entry.status === 'approved');
}

function previewMetaText(entry) {
  if (!entry) return '';
  const parts = [];
  if (entry.status) parts.push(`Status: ${entry.status}`);
  if (entry.timestamp) parts.push(`Source time: ${entry.timestamp}`);
  return parts.join(' · ');
}

function renderPreview(baseId, title, description, entry) {
  const box = document.getElementById(baseId);
  if (!box) return;
  const imgWrap = document.getElementById(`${baseId}Image`).parentElement;
  const img = document.getElementById(`${baseId}Image`);
  const titleNode = document.getElementById(`${baseId}Title`);
  const textNode = document.getElementById(`${baseId}Text`);
  const metaNode = document.getElementById(`${baseId}Meta`);

  titleNode.textContent = title;
  textNode.textContent = description;
  metaNode.textContent = previewMetaText(entry);

  if (hasApprovedImage(entry)) {
    img.onerror = () => {
      img.removeAttribute('src');
      img.alt = '';
      imgWrap.hidden = true;
      delete imgWrap.dataset.imageSrc;
      delete imgWrap.dataset.imageTitle;
      delete imgWrap.dataset.imageMeta;
      box.classList.add('is-empty');
      textNode.textContent = 'The image entry exists, but the local file could not be loaded.';
      metaNode.textContent = 'Missing local image file';
    };
    img.onload = () => {
      img.onerror = null;
    };
    img.src = entry.image;
    img.alt = title;
    imgWrap.hidden = false;
    imgWrap.dataset.imageSrc = entry.image;
    imgWrap.dataset.imageTitle = title;
    imgWrap.dataset.imageMeta = previewMetaText(entry);
    box.classList.remove('is-empty');
  } else {
    img.removeAttribute('src');
    img.alt = '';
    imgWrap.hidden = true;
    delete imgWrap.dataset.imageSrc;
    delete imgWrap.dataset.imageTitle;
    delete imgWrap.dataset.imageMeta;
    box.classList.add('is-empty');
  }
}

function imageThumbMarkup(entry, alt) {
  if (!hasApprovedImage(entry)) return '';
  const meta = previewMetaText(entry);
  return `
    <button
      class="image-zoom-button target-thumb-button"
      type="button"
      data-image-zoom
      data-image-src="${escapeHtml(entry.image)}"
      data-image-title="${escapeHtml(alt)}"
      data-image-meta="${escapeHtml(meta)}"
      aria-label="Enlarge image of ${escapeHtml(alt)}"
      title="Click to enlarge"
    >
      <img class="target-thumb" src="${escapeHtml(entry.image)}" alt="" loading="lazy" decoding="async" onerror="this.closest('button').remove()">
    </button>`;
}

function openImageZoom(trigger) {
  const src = trigger.dataset.imageSrc;
  if (!src) return;
  const title = trigger.dataset.imageTitle || 'Target image';
  const meta = trigger.dataset.imageMeta || '';
  const dialog = $('#imageZoomDialog');
  $('#imageZoomImage').src = src;
  $('#imageZoomImage').alt = title;
  $('#imageZoomTitle').textContent = title;
  $('#imageZoomMeta').textContent = meta;
  dialog.showModal();
}

function closeImageZoom() {
  const dialog = $('#imageZoomDialog');
  if (dialog.open) dialog.close();
  $('#imageZoomImage').removeAttribute('src');
}

function updateImageLibraryStatus() {
  const node = document.getElementById('imageLibraryStatus');
  if (!node || !state.imageManifest) return;
  const allEntries = Object.values(state.imageManifest.secondaryTargets || {});
  const approved = allEntries.filter((entry) => entry.status === 'approved' && entry.image).length;
  const totalTargets = state.data?.items?.length || allEntries.length;
  node.textContent = `Secondary images: ${approved}/${totalTargets} approved local files · 64-target name pool verified`;
}

function normalizeSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/gi, 'oe')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

function ensureCurrentInterface() {
  const requiredIds = [
    'calculator', 'players', 'primaryTarget', 'primaryTargetHint', 'primaryValue', 'firstWeeklySale',
    'hardMode', 'sellPrimary', 'eliteCompleted',
    'targetSearch', 'addCategory', 'addTarget', 'addValue', 'addQuantity', 'addRequested', 'addCrispGallery',
    'addTargetButton', 'categoryReference', 'lootRows', 'selectedTable',
    'scopedEmpty', 'scopedCount', 'netTake', 'grossTake', 'recommendationList'
  ];
  const missing = requiredIds.filter((id) => !document.getElementById(id));
  if (!missing.length) {
    sessionStorage.removeItem('kortz-ui-reload');
    return true;
  }

  if (!sessionStorage.getItem('kortz-ui-reload')) {
    sessionStorage.setItem('kortz-ui-reload', UI_VERSION);
    const url = new URL(location.href);
    url.searchParams.set('ui', UI_VERSION);
    location.replace(url.toString());
    return false;
  }

  throw new Error(`Interface files are out of sync. Missing: ${missing.join(', ')}`);
}

function defaultSettings(data) {
  const defaultTarget = data.meta.primaryTargets[0];
  return {
    players: 1,
    primaryTarget: defaultTarget.id,
    primaryValue: defaultTarget.repeatValue,
    firstWeeklySale: true,
    hardMode: false,
    sellPrimary: true,
    eliteCompleted: false,
    items: {},
  };
}

function decodeSharedState() {
  const encoded = new URLSearchParams(location.search).get('s');
  if (!encoded) return null;
  try {
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(normalized)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function encodeSharedState(payload) {
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function normalizeSettings(settings, data) {
  if (!settings.primaryTarget && settings.primaryName) {
    const match = data.meta.primaryTargets.find((target) => target.name === settings.primaryName);
    settings.primaryTarget = match?.id || 'other-weekly-target';
  }
  return settings;
}

function loadSettings(data) {
  const defaults = defaultSettings(data);
  const shared = decodeSharedState();
  if (shared) return normalizeSettings({ ...defaults, ...shared, items: shared.items || {} }, data);
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? normalizeSettings({ ...defaults, ...saved, items: saved.items || {} }, data) : defaults;
  } catch {
    return defaults;
  }
}

function getPrimaryTarget() {
  return state.data.meta.primaryTargets.find((target) => target.id === $('#primaryTarget').value)
    || state.data.meta.primaryTargets[0];
}

function renderPrimaryTargets(data) {
  $('#primaryTarget').innerHTML = data.meta.primaryTargets
    .map((target) => `<option value="${target.id}">${target.name}</option>`)
    .join('');
}

function syncPrimaryTarget({ overwriteValue = true } = {}) {
  const target = getPrimaryTarget();
  const input = $('#primaryValue');
  const hasKnownValue = Number.isFinite(Number(target.repeatValue));
  if (overwriteValue && hasKnownValue) input.value = String(target.repeatValue);
  if (overwriteValue && !hasKnownValue) input.value = '0';

  // Primary payouts can change with the current rotation or planning board.
  // Always allow the user to replace the stored estimate with the in-game value.
  input.readOnly = false;
  input.classList.add('editable-value');

  const currentValue = Math.max(0, Number(input.value) || 0);
  const valueText = currentValue > 0
    ? `Current repeat-sale value ${money(currentValue)} · first weekly sale ${money(currentValue * state.data.meta.defaultPrimary.weeklyMultiplier)}.`
    : 'Enter the repeat-sale value shown on your planning board.';
  $('#primaryTargetHint').textContent = `${valueText} ${target.note || ''}`.trim();
}

function collectSettings() {
  const items = {};
  $$('.loot-row').forEach((row) => {
    const quantity = Math.max(0, Number(row.querySelector('[data-field="quantity"]').value) || 0);
    if (!quantity) return;
    items[row.dataset.id] = {
      quantity,
      value: Math.max(0, Number(row.querySelector('[data-field="value"]').value) || 0),
      requested: row.querySelector('[data-field="requested"]').checked,
      requiresTwoPlayers: row.querySelector('[data-field="twoPlayers"]').checked,
    };
  });

  return {
    players: Number($('#players').value),
    primaryTarget: $('#primaryTarget').value,
    primaryValue: Number($('#primaryValue').value),
    firstWeeklySale: boolValue('#firstWeeklySale'),
    hardMode: boolValue('#hardMode'),
    sellPrimary: boolValue('#sellPrimary'),
    eliteCompleted: boolValue('#eliteCompleted'),
    items,
  };
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collectSettings()));
}

function updateSelectedVisibility() {
  const rows = $$('.loot-row');
  $('#selectedTable').hidden = rows.length === 0;
  $('#scopedEmpty').hidden = rows.length !== 0;
  const total = rows.reduce((sum, row) => sum + (Number(row.querySelector('[data-field="quantity"]').value) || 0), 0);
  $('#scopedCount').textContent = String(total);
}

function createSelectedRow(item, itemState = {}) {
  const category = state.data.categories[item.category];
  const row = document.createElement('tr');
  row.className = 'loot-row';
  row.dataset.id = item.id;
  row.dataset.defaultValue = String(item.value ?? 0);
  row.innerHTML = `
    <td class="item-cell">
      <div class="item-flex">
        ${imageThumbMarkup(getSecondaryImageEntry(item.id), item.name)}
        <div>
          <strong>${item.name}</strong>
          <span>${category.label} · ${category.bagPercent}% bag · ${item.location}</span>
        </div>
      </div>
    </td>
    <td><input data-field="value" type="number" min="0" step="500" value="${itemState.value ?? item.value ?? 0}" aria-label="Value of ${item.name}"></td>
    <td><input class="quantity" data-field="quantity" type="number" min="1" max="4" step="1" value="${itemState.quantity ?? 1}" aria-label="Amount of ${item.name}"></td>
    <td><input data-field="requested" type="checkbox" ${itemState.requested ? 'checked' : ''} aria-label="${item.name} is on the Buyer Request List"></td>
    <td><input data-field="twoPlayers" type="checkbox" ${itemState.requiresTwoPlayers ? 'checked' : ''} aria-label="${item.name} spawned in Crisp Gallery"></td>
    <td><button class="remove-button" data-action="remove" type="button" title="Remove ${item.name}">×</button></td>
  `;
  $('#lootRows').appendChild(row);
  updateSelectedVisibility();
  return row;
}

function addOrIncrementTarget(item, options = {}) {
  const existing = document.querySelector(`.loot-row[data-id="${CSS.escape(item.id)}"]`);
  const quantityToAdd = Math.max(1, Math.floor(Number(options.quantity) || 1));
  const selectedValue = Math.max(0, Number(options.value ?? item.value ?? 0) || 0);
  if (existing) {
    const quantityInput = existing.querySelector('[data-field="quantity"]');
    quantityInput.value = Math.min(4, (Number(quantityInput.value) || 0) + quantityToAdd);
    existing.querySelector('[data-field="value"]').value = selectedValue;
    if (options.requested) existing.querySelector('[data-field="requested"]').checked = true;
    if (options.requiresTwoPlayers) existing.querySelector('[data-field="twoPlayers"]').checked = true;
    return existing;
  }
  return createSelectedRow(item, {
    quantity: quantityToAdd,
    value: selectedValue,
    requested: Boolean(options.requested),
    requiresTwoPlayers: Boolean(options.requiresTwoPlayers),
  });
}

function applySettings(settings) {
  $('#players').value = String(settings.players);
  $('#primaryTarget').value = settings.primaryTarget;
  $('#primaryValue').value = settings.primaryValue;
  syncPrimaryTarget({ overwriteValue: false });
  $('#firstWeeklySale').value = String(Boolean(settings.firstWeeklySale));
  $('#hardMode').value = String(Boolean(settings.hardMode));
  $('#sellPrimary').value = String(Boolean(settings.sellPrimary));
  $('#eliteCompleted').value = String(Boolean(settings.eliteCompleted));
  $('#lootRows').innerHTML = '';

  for (const [id, itemState] of Object.entries(settings.items || {})) {
    if (!(Number(itemState.quantity) > 0)) continue;
    const item = state.data.items.find((entry) => entry.id === id);
    if (item) createSelectedRow(item, itemState);
  }
  updateSelectedVisibility();
}

function renderPicker(data) {
  const categorySelect = $('#addCategory');
  categorySelect.innerHTML = [
    '<option value="all">All categories</option>',
    ...Object.entries(data.categories)
      .map(([id, category]) => `<option value="${id}">${category.label} — ${category.bagPercent}% bag</option>`),
  ].join('');
  syncTargetOptions();
}

function getFilteredPickerItems() {
  const categoryId = $('#addCategory').value;
  const query = normalizeSearch($('#targetSearch').value);
  return state.data.items
    .filter((item) => categoryId === 'all' || item.category === categoryId)
    .filter((item) => {
      if (!query) return true;
      const category = state.data.categories[item.category];
      const searchable = normalizeSearch([
        item.name,
        item.location,
        category.label,
        ...(item.aliases || []),
      ].join(' '));
      return query.split(' ').every((part) => searchable.includes(part));
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

function syncTargetOptions() {
  const select = $('#addTarget');
  const previous = select.value;
  const items = getFilteredPickerItems();
  select.innerHTML = items.length
    ? items.map((item) => `<option value="${item.id}">${item.name} — ${itemValueLabel(item)}</option>`).join('')
    : '<option value="">No matching targets</option>';
  if (items.some((item) => item.id === previous)) select.value = previous;
  updateTargetHint({ overwriteValue: true });
}

function updateTargetHint({ overwriteValue = true } = {}) {
  const item = state.data.items.find((entry) => entry.id === $('#addTarget').value);
  if (!item) {
    $('#targetHint').textContent = 'No targets match the current search and category filter.';
    renderPreview('pickerPreview', 'Scoped target image', 'No approved local image yet.', null);
    if (overwriteValue) $('#addValue').value = '0';
    return;
  }
  const category = state.data.categories[item.category];
  const hasKnownValue = hasKnownItemValue(item);
  if (overwriteValue) $('#addValue').value = hasKnownValue ? String(item.value) : '0';
  const range = Array.isArray(item.valueRange) && item.valueRange.length === 2
    ? ` · observed ${money(item.valueRange[0])}–${money(item.valueRange[1])}`
    : '';
  const valueText = hasKnownValue ? `estimate ${money(item.value)}${range}` : 'no verified default — enter Raf value';
  $('#targetHint').textContent = `${category.bagPercent}% of one bag · ${valueText} · ${item.location}`;
  renderPreview('pickerPreview', item.name, `${category.label} · ${category.bagPercent}% bag · ${item.location}`, getSecondaryImageEntry(item.id));
}

function renderCategoryReference(data) {
  const body = $('#categoryReference');
  body.innerHTML = Object.entries(data.categories).map(([categoryId, category]) => {
    const values = data.items
      .filter((item) => item.category === categoryId && hasKnownItemValue(item))
      .map((item) => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const averageFullBag = average * (100 / category.bagPercent);
    return `
      <tr>
        <td>${category.label}</td>
        <td>${money(min)}–${money(max)}</td>
        <td>${money(averageFullBag)}</td>
        <td>${category.bagPercent}%</td>
      </tr>
    `;
  }).join('');
}

function getOptimizationItems() {
  return $$('.loot-row').map((row) => {
    const item = state.data.items.find((entry) => entry.id === row.dataset.id);
    const category = state.data.categories[item.category];
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      bagPercent: category.bagPercent,
      value: Number(row.querySelector('[data-field="value"]').value) || 0,
      quantity: Number(row.querySelector('[data-field="quantity"]').value) || 0,
      requested: row.querySelector('[data-field="requested"]').checked,
      requiresTwoPlayers: row.querySelector('[data-field="twoPlayers"]').checked,
    };
  });
}

function groupSelected(items) {
  const groups = new Map();
  for (const item of items) {
    const existing = groups.get(item.id) || { ...item, count: 0 };
    existing.count += 1;
    groups.set(item.id, existing);
  }
  return [...groups.values()].sort((a, b) => (b.value / b.bagPercent) - (a.value / a.bagPercent));
}

function renderRecommendation(optimization) {
  const list = $('#recommendationList');
  list.innerHTML = '';
  const grouped = groupSelected(optimization.selected);
  if (!grouped.length) {
    list.innerHTML = '<li class="empty">Add scoped targets to calculate the best pickup order.</li>';
    return;
  }

  for (const item of grouped) {
    const totalBagPercent = item.bagPercent * item.count;
    const bagUnits = (totalBagPercent / 100).toFixed(2);
    const li = document.createElement('li');
    li.innerHTML = `
      ${imageThumbMarkup(getSecondaryImageEntry(item.id), item.name)}
      <span class="route-count">${item.count}×</span>
      <span class="route-name"> ${item.name}</span>
      <span class="route-meta"> — ${bagUnits} bags · ${money(item.value * item.count)}</span>
    `;
    list.appendChild(li);
  }
}

function renderWarnings(optimization) {
  const messages = [];
  if (optimization.inaccessible.length) {
    messages.push(`${optimization.inaccessible.length} Crisp Gallery target(s) were excluded because the run is solo.`);
  }
  if (optimization.requestedCount && !optimization.buyerRequestCompleted) {
    messages.push('The full Buyer Request List does not fit, so the bonus was not applied.');
  }
  $('#warnings').innerHTML = messages.map((message) => `<div class="warning">${message}</div>`).join('');
}

function recalculate() {
  const data = state.data;
  const players = Number($('#players').value);
  const hardMode = boolValue('#hardMode');
  const firstWeeklySale = boolValue('#firstWeeklySale');
  const primary = calculatePrimary({
    repeatValue: $('#primaryValue').value,
    firstWeeklySale,
    hardMode,
    sold: boolValue('#sellPrimary'),
    weeklyMultiplier: data.meta.defaultPrimary.weeklyMultiplier,
    hardMultiplier: data.meta.defaultPrimary.hardMultiplier,
  });

  const optimization = optimizeLoot({
    items: getOptimizationItems(),
    players,
    buyerBonus: data.meta.buyerRequestBonus,
  });
  const summary = calculateSummary({
    primary,
    optimization,
    eliteCompleted: boolValue('#eliteCompleted'),
    hardMode,
    eliteBonus: data.meta.eliteBonus,
    valueLoss: 0,
    planningFee: 0,
  });

  $('#netTake').textContent = money(summary.net);
  $('#grossTake').textContent = money(summary.gross);
  $('#primaryTake').textContent = money(summary.primary);
  $('#secondaryTake').textContent = money(summary.secondary);
  $('#buyerBonusTake').textContent = money(summary.buyerBonus);
  $('#eliteTake').textContent = money(summary.elite);

  const usedBags = optimization.used / 100;
  const totalBags = optimization.capacity / 100;
  const remainingBags = optimization.remaining / 100;
  $('#bagUsed').textContent = `${usedBags.toFixed(2)} / ${totalBags.toFixed(2)} bags`;
  $('#bagRemaining').textContent = `${remainingBags.toFixed(2)} bags available`;
  $('#bagBar').style.width = `${optimization.capacity ? (optimization.used / optimization.capacity) * 100 : 0}%`;
  $('#buyerStatus').textContent = optimization.buyerRequestCompleted
    ? 'Buyer Request List completed: bonus applied'
    : 'Buyer request not completed';
  $('#buyerStatus').classList.toggle('success', optimization.buyerRequestCompleted);

  updateSelectedVisibility();
  renderRecommendation(optimization);
  renderWarnings(optimization);
  saveSettings();
}

function renderSources(data) {
  $('#sourcesList').innerHTML = data.sources.map((source) => `
    <li><a href="${source.url}" target="_blank" rel="noreferrer">${source.name}</a><span>${source.scope}</span></li>
  `).join('');
}

function addPickerTarget() {
  const item = state.data.items.find((entry) => entry.id === $('#addTarget').value);
  if (!item) return;
  addOrIncrementTarget(item, {
    value: $('#addValue').value,
    quantity: $('#addQuantity').value,
    requested: $('#addRequested').value === 'true',
    requiresTwoPlayers: $('#addCrispGallery').value === 'true',
  });
  $('#addQuantity').value = 1;
  $('#addRequested').value = 'false';
  $('#addCrispGallery').value = 'false';
  updateTargetHint({ overwriteValue: true });
  recalculate();
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const zoomTrigger = event.target.closest('[data-image-zoom]');
    if (zoomTrigger) {
      event.preventDefault();
      openImageZoom(zoomTrigger);
    }
  });

  $('#closeImageZoomButton').addEventListener('click', closeImageZoom);
  $('#imageZoomDialog').addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeImageZoom();
  });

  document.addEventListener('input', (event) => {
    if (event.target.id === 'targetSearch') {
      syncTargetOptions();
      return;
    }
    if (event.target.closest('.loot-row')) recalculate();
    if (event.target.id === 'primaryValue') {
      syncPrimaryTarget({ overwriteValue: false });
      recalculate();
    }
  });

  document.addEventListener('change', (event) => {
    if (event.target.id === 'primaryTarget') {
      syncPrimaryTarget();
      recalculate();
      return;
    }
    if (event.target.id === 'addCategory') {
      syncTargetOptions();
      return;
    }
    if (event.target.id === 'addTarget') {
      updateTargetHint({ overwriteValue: true });
      return;
    }
    if (event.target.closest('#calculator')) recalculate();
  });

  $('#addTargetButton').addEventListener('click', addPickerTarget);

  $('#lootRows').addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-action="remove"]');
    if (!removeButton) return;
    removeButton.closest('.loot-row').remove();
    recalculate();
  });

  $('#fillDemoButton').addEventListener('click', () => {
    const ids = ['great-circle-back', 'fertility-silver', 'yellow-topaz'];
    for (const id of ids) {
      const item = state.data.items.find((entry) => entry.id === id);
      if (item) addOrIncrementTarget(item, { quantity: 1 });
    }
    recalculate();
  });

  $('#clearLootButton').addEventListener('click', () => {
    $('#lootRows').innerHTML = '';
    recalculate();
  });

  $('#resetButton').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    history.replaceState({}, '', location.pathname);
    applySettings(defaultSettings(state.data));
    recalculate();
  });

  $('#shareButton').addEventListener('click', async () => {
    const url = new URL(location.href);
    url.search = '';
    url.searchParams.set('s', encodeSharedState(collectSettings()));
    await navigator.clipboard.writeText(url.toString());
    $('#shareButton').textContent = 'Link copied';
    setTimeout(() => { $('#shareButton').textContent = 'Copy link with settings'; }, 1600);
  });

  $('#sourcesButton').addEventListener('click', () => $('#sourcesDialog').showModal());
  $('#closeSourcesButton').addEventListener('click', () => $('#sourcesDialog').close());
}

async function init() {
  try {
    if (!ensureCurrentInterface()) return;
    const [lootResponse, imageManifestResponse] = await Promise.all([
      fetch(`./data/loot.json?v=${UI_VERSION}`, { cache: 'no-store' }),
      fetch(`./data/image-manifest.json?v=${UI_VERSION}`, { cache: 'no-store' }),
    ]);
    if (!lootResponse.ok) throw new Error(`HTTP ${lootResponse.status}`);
    if (!imageManifestResponse.ok) throw new Error(`HTTP ${imageManifestResponse.status}`);
    state.data = await lootResponse.json();
    state.imageManifest = await imageManifestResponse.json();
    updateImageLibraryStatus();
    renderPrimaryTargets(state.data);
    renderPicker(state.data);
    renderCategoryReference(state.data);
    renderSources(state.data);
    applySettings(loadSettings(state.data));
    bindEvents();
    recalculate();
  } catch (error) {
    document.body.innerHTML = `<main class="load-error"><h1>Could not start the calculator</h1><p>${error.message}</p><p>Refresh once with Ctrl+F5. If the error remains, open the page with <code>?ui=${UI_VERSION}</code> at the end of the URL.</p></main>`;
  }
}

init();
