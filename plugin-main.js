(() => {
const FALLBACK_PLUGIN_VERSION = "0.3.6";
const PAGEBAR_ITEM_KEY = "degrande-bullet-threading-pagebar";
const TOOLBAR_ITEM_KEY = "degrande-bullet-threading-toolbar";
const TOOLBAR_TOGGLE_ID = "degrande-bullet-threading-toolbar-toggle";
const PAGEBAR_ROOT_ID = "degrande-bullet-threading-pagebar";
const MAIN_CONTENT_CONTAINER_ID = "main-content-container";
const OVERLAY_ROOT_ID = "degrande-bullet-threading-overlay";
const OVERLAY_ANCHOR_CLASS = "dgbt-overlay-anchor";
const STYLE_RESOURCE = "custom.css";
const RUNTIME_STYLE_ELEMENT_ID = "degrande-bullet-threading-runtime-style";
const CUSTOM_COLLAPSE_OVERLAY_ENABLED = false;
const VISUAL_COLLAPSE_GLYPHS_ENABLED = true;
const PAGEBAR_REGISTRY_KEY = "__degrandeBulletThreadingRegisteredPagebars";
const TOOLBAR_REGISTRY_KEY = "__degrandeBulletThreadingRegisteredToolbars";
const COMMAND_REGISTRY_KEY = "__degrandeBulletThreadingRegisteredCommands";
const CLEANUP_REGISTRY_KEY = "__degrandeBulletThreadingCleanup";
const THREADING_STATE_CLASS = "dgbt-threading-enabled";
const MAIN_UI_INLINE_STYLE = {
  position: "fixed",
  top: "0",
  right: "0",
  bottom: "0",
  left: "0",
  zIndex: 999,
  width: "100vw",
  height: "100vh",
  maxWidth: "100vw",
  maxHeight: "100vh",
  overflow: "hidden",
  background: "transparent",
};
const PROPERTY_CONTAINER_SELECTOR = [
  ".page-properties",
  ".block-properties",
  ".properties",
  ".ls-properties-area",
  ".ls-page-properties",
  ".property-pair",
  ".property-key",
  ".property-value-container",
  ".page-property-key",
  "[data-node-type='properties']",
  "[data-node-type='page-properties']",
  "[data-properties='true']",
  "[data-is-property='true']",
  "[data-property-title]",
  "[data-property-type]",
].join(", ");

try {
  if (typeof window[CLEANUP_REGISTRY_KEY] === "function") {
    window[CLEANUP_REGISTRY_KEY]();
  }
} catch (_error) {
  // Ignore stale cleanup failures from previous plugin instances.
}

const MOTION_CHOICES = [
  "Still",
  "Drift",
];

const THREAD_SHAPE_CHOICES = [
  "Square",
  "Rounded",
  "Extra Rounded",
];

const THREAD_END_CHOICES = [
  "Top",
  "Side",
  "Original",
  "Bouble",
];

const THREAD_END_SETTING_CHOICES = THREAD_END_CHOICES.filter((choice) => choice !== "Bouble");

const THREAD_WIDTH_CHOICES = [
  "1px",
  "2px",
  "3px",
  "4px",
];

const RAINBOW_ACCENT_TOKEN = "acc-rainbow";
const RAINBOW_PRESET_TOKENS = ["red", "orange", "yellow", "green", "teal", "blue", "indigo", "pink"];

const ACCENT_PRESETS = [
  { token: "red", label: "Red", group: "preset", swatch: "#ef4444", cssValue: "#ef4444", previewColor: "#ef4444" },
  { token: "orange", label: "Orange", group: "preset", swatch: "#fb923c", cssValue: "#fb923c", previewColor: "#fb923c" },
  { token: "yellow", label: "Yellow", group: "preset", swatch: "#eab308", cssValue: "#eab308", previewColor: "#eab308" },
  { token: "green", label: "Green", group: "preset", swatch: "#22c55e", cssValue: "#22c55e", previewColor: "#22c55e" },
  { token: "teal", label: "Teal", group: "preset", swatch: "#14b8a6", cssValue: "#14b8a6", previewColor: "#14b8a6" },
  { token: "blue", label: "Blue", group: "preset", swatch: "#1f7ae0", cssValue: "#1f7ae0", previewColor: "#1f7ae0" },
  { token: "indigo", label: "Indigo", group: "preset", swatch: "#6366f1", cssValue: "#6366f1", previewColor: "#6366f1" },
  { token: "purple", label: "Purple", group: "preset", swatch: "#a855f7", cssValue: "#a855f7", previewColor: "#a855f7" },
  { token: "pink", label: "Pink", group: "preset", swatch: "#ec4899", cssValue: "#ec4899", previewColor: "#ec4899" },
  { token: "grey", label: "Grey", group: "preset", swatch: "#9ca3af", cssValue: "#9ca3af", previewColor: "#9ca3af" },
  { token: "mint", label: "Mint", group: "preset", swatch: "#34d399", cssValue: "#34d399", previewColor: "#34d399" },
  { token: "rose", label: "Rose", group: "preset", swatch: "#f43f5e", cssValue: "#f43f5e", previewColor: "#f43f5e" },
  { token: "amber", label: "Amber", group: "preset", swatch: "#f59e0b", cssValue: "#f59e0b", previewColor: "#f59e0b" },
  { token: "sky", label: "Sky", group: "preset", swatch: "#38bdf8", cssValue: "#38bdf8", previewColor: "#38bdf8" },
  { token: "lime", label: "Lime", group: "preset", swatch: "#84cc16", cssValue: "#84cc16", previewColor: "#84cc16" },
  { token: "slate", label: "Slate", group: "preset", swatch: "#64748b", cssValue: "#64748b", previewColor: "#64748b" },
  { token: RAINBOW_ACCENT_TOKEN, label: "Rainbow", group: "accent", swatch: "#ef4444", cssValue: "#ef4444", previewColor: "#ef4444" },
  { token: "acc-app-accent", label: "Logseq Accent", group: "accent", swatch: "var(--ls-active-primary-color, var(--ls-link-text-color, #10b981))", cssValue: "var(--ls-active-primary-color, var(--ls-link-text-color, #10b981))", previewColor: "#10b981" },
  { token: "acc-lt-blue", label: "Accent Lt Blue", group: "accent", swatch: "#b0c7ea", cssValue: "#8aa6d3", previewColor: "#8aa6d3" },
  { token: "acc-coral", label: "Accent Coral", group: "accent", swatch: "#f49e8c", cssValue: "#de7c68", previewColor: "#de7c68" },
  { token: "acc-salmon", label: "Accent Salmon", group: "accent", swatch: "#f49898", cssValue: "#de7a7a", previewColor: "#de7a7a" },
  { token: "acc-rose", label: "Accent Rose", group: "accent", swatch: "#f68fbb", cssValue: "#d96798", previewColor: "#d96798" },
  { token: "acc-blush", label: "Accent Blush", group: "accent", swatch: "#e992cc", cssValue: "#d16ead", previewColor: "#d16ead" },
  { token: "acc-lilac", label: "Accent Lilac", group: "accent", swatch: "#e09bec", cssValue: "#c372d3", previewColor: "#c372d3" },
  { token: "acc-lavender", label: "Accent Lavender", group: "accent", swatch: "#c69ee4", cssValue: "#aa7cd1", previewColor: "#aa7cd1" },
  { token: "acc-indigo", label: "Accent Indigo", group: "accent", swatch: "#866cee", cssValue: "#6d51d9", previewColor: "#6d51d9" },
  { token: "acc-periwinkle", label: "Accent Periwinkle", group: "accent", swatch: "#93a2f7", cssValue: "#7889e4", previewColor: "#7889e4" },
  { token: "acc-sky", label: "Accent Sky", group: "accent", swatch: "#71b2f7", cssValue: "#4a90de", previewColor: "#4a90de" },
  { token: "acc-cyan", label: "Accent Cyan", group: "accent", swatch: "#7acee1", cssValue: "#4caec5", previewColor: "#4caec5" },
  { token: "acc-teal", label: "Accent Teal", group: "accent", swatch: "#7ecdbe", cssValue: "#59af9c", previewColor: "#59af9c" },
  { token: "acc-sage", label: "Accent Sage", group: "accent", swatch: "#9fd2af", cssValue: "#7eb390", previewColor: "#7eb390" },
  { token: "acc-apricot", label: "Accent Apricot", group: "accent", swatch: "#fca877", cssValue: "#df8a57", previewColor: "#df8a57" },
];
const ACCENT_PRESET_MAP = Object.fromEntries(ACCENT_PRESETS.map((preset) => [preset.token, preset]));

const SETTINGS_SCHEMA = [
  {
    key: "threadingEnabled",
    type: "boolean",
    title: "Enable threading preview",
    description: "Turn the initial Degrande Bullet Threading scaffold on or off.",
    default: true,
  },
  {
    key: "accentColor",
    type: "string",
    title: "Accent color",
    description: "Hex color used by the threading paths and preview.",
    default: "#1f7ae0",
  },
  {
    key: "accentColorMode",
    type: "enum",
    title: "Accent source",
    description: "Internal selection mode for the accent color.",
    default: "preset",
    enumChoices: ["custom", "preset"],
    enumPicker: "select",
  },
  {
    key: "accentPresetToken",
    type: "string",
    title: "Accent preset token",
    description: "Internal preset token for the selected accent color.",
    default: "acc-rainbow",
  },
  {
    key: "threadWidth",
    type: "enum",
    title: "Thread width",
    description: "Width of the bullet threading path.",
    default: "3px",
    enumChoices: THREAD_WIDTH_CHOICES,
    enumPicker: "radio",
  },
  {
    key: "motionLevel",
    type: "enum",
    title: "Motion level",
    description: "How lively the threading preview should feel while we build it out.",
    default: "Still",
    enumChoices: MOTION_CHOICES,
    enumPicker: "select",
  },
  {
    key: "threadShape",
    type: "enum",
    title: "Thread shape",
    description: "Choose between square bends, rounded bends, or extra-rounded bends (Original end only).",
    default: "Rounded",
    enumChoices: THREAD_SHAPE_CHOICES,
    enumPicker: "select",
  },
  {
    key: "threadEnd",
    type: "enum",
    title: "Thread end",
    description: "Where the thread meets the target bullet: above it, beside it (short stub), or to the dot edge (original).",
    default: "Original",
    enumChoices: THREAD_END_SETTING_CHOICES,
    enumPicker: "select",
  },
];

const state = {
  enabled: true,
  accentColorMode: "preset",
  accentPresetToken: "acc-rainbow",
  accentColor: "#1f7ae0",
  threadWidth: "3px",
  motionLevel: "Still",
  threadShape: "Rounded",
  threadEnd: "Original",
  renderTimer: null,
  isDbGraph: false,
  overlayAnchor: null,
  overlayRoot: null,
  overlaySvg: null,
  overlaySegments: null,
  overlayCorePath: null,
  collapseLayer: null,
  collapseBlockRefs: [],
  collapseHoverCleanups: [],
  collapseVisibleIndex: -1,
  rainbowBulletElements: [],
  hostObserver: null,
  cleanupFns: [],
  panelMounted: false,
  panelPreviewRaf: null,
  lastRuntimeStyleText: "",
  lastEnabledClassState: null,
  settingsSelfUpdate: 0,
};

function getAccentPreset(token) {
  return ACCENT_PRESET_MAP[String(token || "").trim()] || null;
}

function registerCleanup(fn) {
  if (typeof fn === "function") {
    state.cleanupFns.push(fn);
  }
}

function cleanupPluginRuntime() {
  while (state.cleanupFns.length) {
    const cleanupFn = state.cleanupFns.pop();

    try {
      cleanupFn();
    } catch (_error) {
      // Ignore cleanup failures from stale DOM/plugin state.
    }
  }

  if (state.hostObserver) {
    state.hostObserver.disconnect();
    state.hostObserver = null;
  }

  if (state.renderTimer) {
    cancelAnimationFrame(state.renderTimer);
    state.renderTimer = null;
  }

  cleanupCollapseHoverListeners();
  clearRainbowBulletStyles();
  state.overlayRoot?.remove?.();
  state.overlayRoot = null;
  state.overlaySvg = null;
  state.overlaySegments = null;
  state.overlayCorePath = null;
  state.collapseLayer = null;
  state.collapseBlockRefs = [];
  state.overlayAnchor?.classList?.remove?.(OVERLAY_ANCHOR_CLASS);
  state.overlayAnchor = null;
}

function rgbChannelToHex(channel) {
  return Math.max(0, Math.min(255, channel)).toString(16).padStart(2, "0");
}

function rgbStringToHex(value) {
  const match = String(value || "").trim().match(/^rgba?\(([^)]+)\)$/i);

  if (!match) {
    return isHexColorValue(value) ? sanitizeHexColor(value) : "";
  }

  const parts = match[1]
    .split(",")
    .map((part) => Number.parseFloat(part.trim()))
    .filter(Number.isFinite);

  if (parts.length < 3) {
    return "";
  }

  return `#${rgbChannelToHex(parts[0])}${rgbChannelToHex(parts[1])}${rgbChannelToHex(parts[2])}`;
}

function resolveCssColorValue(value, fallback = "#1f7ae0") {
  if (isHexColorValue(value)) {
    return sanitizeHexColor(value);
  }

  const hostDocument = getHostDocument();
  const mountTarget = hostDocument.body || hostDocument.documentElement;

  if (!mountTarget) {
    return fallback;
  }

  try {
    const probe = hostDocument.createElement("span");
    probe.style.position = "absolute";
    probe.style.opacity = "0";
    probe.style.pointerEvents = "none";
    probe.style.color = String(value || fallback);
    mountTarget.appendChild(probe);
    const computedColor = (hostDocument.defaultView || window).getComputedStyle(probe).color;
    probe.remove();
    return rgbStringToHex(computedColor) || fallback;
  } catch (_error) {
    return fallback;
  }
}

function getPresetDisplayColor(presetOrToken) {
  const preset = typeof presetOrToken === "string"
    ? getAccentPreset(presetOrToken)
    : presetOrToken;

  if (!preset) {
    return "#1f7ae0";
  }

  return resolveCssColorValue(preset.cssValue || preset.swatch || preset.previewColor, preset.previewColor || "#1f7ae0");
}

function isRainbowAccentMode() {
  return state.accentColorMode === "preset" && state.accentPresetToken === RAINBOW_ACCENT_TOKEN;
}

function getRainbowPaletteColors() {
  return RAINBOW_PRESET_TOKENS.map((token) => getPresetDisplayColor(token));
}

function getRainbowSegmentColor(depthIndex) {
  const palette = getRainbowPaletteColors();
  const normalizedIndex = Math.max(0, Number(depthIndex) || 0);
  return palette[(normalizedIndex * 3 + 1) % palette.length] || "#1f7ae0";
}

function getResolvedAccentCssValue() {
  if (isRainbowAccentMode()) {
    return getRainbowSegmentColor(0);
  }

  if (state.accentColorMode === "preset") {
    // For Logseq Accent, return the raw CSS variable so it stays dynamic in the host document.
    if (state.accentPresetToken === "acc-app-accent") {
      const preset = getAccentPreset("acc-app-accent");

      if (preset?.cssValue) {
        return preset.cssValue;
      }
    }

    return getPresetDisplayColor(state.accentPresetToken) || state.accentColor;
  }

  return state.accentColor;
}

function getResolvedAccentPreviewColor() {
  if (isRainbowAccentMode()) {
    return getRainbowSegmentColor(0);
  }

  if (state.accentColorMode === "preset") {
    return getPresetDisplayColor(state.accentPresetToken);
  }

  return state.accentColor;
}

function getAccentSelectionLabel() {
  if (isRainbowAccentMode()) {
    return "Rainbow mode";
  }

  if (state.accentColorMode === "preset") {
    const preset = getAccentPreset(state.accentPresetToken);
    return preset ? `${preset.label} · ${getResolvedAccentPreviewColor()}` : "Preset accent";
  }

  return state.accentColor;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getPluginVersion() {
  return document
    .querySelector('meta[name="degrande-bullet-threading-version"]')
    ?.getAttribute("content")
    || FALLBACK_PLUGIN_VERSION;
}

const PLUGIN_VERSION = getPluginVersion();

function getHostWindow() {
  try {
    return top || window;
  } catch (_error) {
    return window;
  }
}

function getHostDocument() {
  try {
    return getHostWindow().document || document;
  } catch (_error) {
    return document;
  }
}

function sanitizeHexColor(value) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (/^#[0-9a-fA-F]{6}$/.test(normalized) || /^#[0-9a-fA-F]{3}$/.test(normalized)) {
    return normalized;
  }

  return "#1f7ae0";
}

function isHexColorValue(value) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return /^#[0-9a-fA-F]{6}$/.test(normalized) || /^#[0-9a-fA-F]{3}$/.test(normalized);
}

function applyPluginSettings(settings) {
  state.enabled = settings?.threadingEnabled !== false;
  state.accentColor = sanitizeHexColor(settings?.accentColor);
  state.accentColorMode = settings?.accentColorMode === "preset" && getAccentPreset(settings?.accentPresetToken)
    ? "preset"
    : "custom";
  state.accentPresetToken = getAccentPreset(settings?.accentPresetToken)?.token || "acc-rainbow";
  state.threadWidth = THREAD_WIDTH_CHOICES.includes(settings?.threadWidth) ? settings.threadWidth : "3px";
  state.motionLevel = normalizeMotionLevel(settings?.motionLevel);
  state.threadShape = normalizeThreadShape(settings?.threadShape);
  state.threadEnd = normalizeThreadEnd(settings?.threadEnd);
}

function normalizeMotionLevel(nextValue) {
  return MOTION_CHOICES.includes(nextValue) ? nextValue : "Still";
}

function normalizeThreadShape(nextValue) {
  return THREAD_SHAPE_CHOICES.includes(nextValue) ? nextValue : "Rounded";
}

function normalizeThreadEnd(nextValue) {
  if (nextValue === "Bubble") {
    return "Bouble";
  }

  return THREAD_END_CHOICES.includes(nextValue) ? nextValue : "Original";
}

function getThreadEndToken(value = state.threadEnd) {
  return normalizeThreadEnd(value).toLowerCase().replace(/\s+/g, "-");
}

function getThreadShapeToken(value = state.threadShape) {
  return normalizeThreadShape(value).toLowerCase().replace(/\s+/g, "-");
}

function getMotionTiming() {
  if (state.motionLevel === "Still") {
    return "0ms";
  }

  if (state.motionLevel === "Drift") {
    return "1800ms";
  }

  return "1800ms";
}

function isDuplicateRegistrationError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("duplicate") || message.includes("registered") || message.includes("already exists");
}

function getRegistry(key) {
  const hostWindow = getHostWindow();
  return hostWindow[key] || (hostWindow[key] = new Set());
}

function registerUiItemSafely(type, registryKey, config) {
  const registry = getRegistry(registryKey);

  if (registry.has(config.key)) {
    return false;
  }

  try {
    logseq.App.registerUIItem(type, config);
  } catch (error) {
    if (isDuplicateRegistrationError(error)) {
      registry.add(config.key);
      return false;
    }

    throw error;
  }

  registry.add(config.key);
  return true;
}

function registerCommandPaletteSafely(config, handler) {
  const registry = getRegistry(COMMAND_REGISTRY_KEY);

  if (registry.has(config.key)) {
    return false;
  }

  try {
    logseq.App.registerCommandPalette(config, handler);
  } catch (error) {
    if (isDuplicateRegistrationError(error)) {
      registry.add(config.key);
      return false;
    }

    throw error;
  }

  registry.add(config.key);
  return true;
}

function buildPagebarTemplate() {
  return `
    <section id="${PAGEBAR_ROOT_ID}" class="dgbt-pagebar" data-motion="drift" data-accent-mode="solid" data-shape="square">
      <div class="dgbt-shell">
        <div class="dgbt-thread-rail" aria-hidden="true">
          <span class="dgbt-thread-dot dgbt-thread-dot-top"></span>
          <span class="dgbt-thread-stem"></span>
          <span class="dgbt-thread-dot dgbt-thread-dot-middle"></span>
          <span class="dgbt-thread-branch"></span>
          <span class="dgbt-thread-dot dgbt-thread-dot-end"></span>
        </div>
        <div class="dgbt-copy">
          <div class="dgbt-eyebrow">Degrande Bullet Threading</div>
          <div class="dgbt-title">Active-path threading for Logseq DB</div>
          <div class="dgbt-meta">
            <span class="dgbt-chip" data-role="status-text">Threading active</span>
            <span class="dgbt-chip dgbt-chip-muted" data-role="motion-text">Drift motion</span>
          </div>
        </div>
        <div class="dgbt-actions">
          <button class="dgbt-button" type="button" data-on-click="openThreadingSettings">Open Settings</button>
        </div>
      </div>
    </section>
  `;
}

function removePagebarUi() {
  const hostDocument = getHostDocument();
  const existingRoot = hostDocument.getElementById(PAGEBAR_ROOT_ID);

  if (!existingRoot) {
    return;
  }

  const removableContainer = existingRoot.closest("[data-injected-ui-item], .extensions__pagebar, .pagebar, .cp__pagebar") || existingRoot;
  removableContainer.remove();
}

async function loadWorkspaceCss() {
  const cssUrl = typeof logseq.resolveResourceFullUrl === "function"
    ? logseq.resolveResourceFullUrl(STYLE_RESOURCE)
    : `./${STYLE_RESOURCE}`;
  const response = await fetch(cssUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Unable to load ${STYLE_RESOURCE} (${response.status})`);
  }

  return response.text();
}

async function installStyles() {
  try {
    const cssText = await loadWorkspaceCss();
    logseq.provideStyle(cssText);
  } catch (error) {
    console.error("[Degrande Bullet Threading] Failed to load styles", error);
  }
}

function persistPluginSetting(partialSettings) {
  if (typeof logseq.updateSettings !== "function") {
    return;
  }

  try {
    state.settingsSelfUpdate = Date.now();
    logseq.updateSettings(partialSettings);
  } catch (error) {
    console.error("[Degrande Bullet Threading] Failed to persist settings", error);
  }
}

function setThreadingEnabled(nextValue) {
  state.enabled = Boolean(nextValue);
  persistPluginSetting({ threadingEnabled: state.enabled });
  queueRender();
}

function setAccentColor(nextValue) {
  const normalized = sanitizeHexColor(nextValue);
  state.accentColorMode = "custom";
  state.accentColor = normalized;
  persistPluginSetting({
    accentColorMode: "custom",
    accentColor: normalized,
  });
  queueRender();
}

function setAccentPreset(nextToken) {
  const preset = getAccentPreset(nextToken);

  if (!preset) {
    return;
  }

  state.accentColorMode = "preset";
  state.accentPresetToken = preset.token;
  persistPluginSetting({
    accentColorMode: "preset",
    accentPresetToken: preset.token,
    accentColor: preset.previewColor,
  });
  queueRender();
}

function setThreadWidth(nextValue) {
  const normalized = THREAD_WIDTH_CHOICES.includes(nextValue) ? nextValue : "3px";
  state.threadWidth = normalized;
  persistPluginSetting({ threadWidth: normalized });
  queueRender();
}

function setMotionLevel(nextValue) {
  const normalized = normalizeMotionLevel(nextValue);
  state.motionLevel = normalized;
  persistPluginSetting({ motionLevel: normalized });
  queueRender();
}

function setThreadShape(nextValue) {
  const normalized = normalizeThreadShape(nextValue);
  state.threadShape = normalized;
  persistPluginSetting({ threadShape: normalized });
  queueRender();
}

function setThreadEnd(nextValue) {
  const normalized = normalizeThreadEnd(nextValue);
  state.threadEnd = normalized;
  persistPluginSetting({ threadEnd: normalized });
  queueRender();
}

function buildAccentPresetButtons(group) {
  return ACCENT_PRESETS
    .filter((preset) => preset.group === group)
    .map((preset) => `
      <button
        class="dgbt-accent-swatch-button${state.accentColorMode === "preset" && state.accentPresetToken === preset.token ? " is-active" : ""}${preset.token === "acc-app-accent" ? " is-special" : ""}${preset.token === RAINBOW_ACCENT_TOKEN ? " is-rainbow" : ""}"
        type="button"
        data-action="set-accent-preset"
        data-value="${preset.token}"
        title="${escapeHtml(preset.label)}"
        aria-label="Set accent to ${escapeHtml(preset.label)}"
        style="--dgbt-swatch-color:${getPresetDisplayColor(preset)};"
      >${preset.token === "acc-app-accent" ? "A" : preset.token === RAINBOW_ACCENT_TOKEN ? "R" : ""}</button>
    `)
    .join("");
}

function buildPanelMarkup() {
  return `
    <div class="dgbt-panel-shell">
      <div class="dgbt-panel-backdrop" data-action="close-panel"></div>
      <section class="dgbt-panel-window" aria-label="Degrande Bullet Threading settings panel">
        <header class="dgbt-panel-header">
          <div>
            <p class="dgbt-panel-eyebrow">Logseq DB Threading</p>
            <div class="dgbt-panel-title-row">
              <h1>Degrande Bullet Threading</h1>
              <span class="dgbt-panel-version">v${escapeHtml(PLUGIN_VERSION)}</span>
            </div>
            <p class="dgbt-panel-subtitle">Tune accent, width, and motion. Changes apply directly to the graph.</p>
          </div>
          <div class="dgbt-panel-header-actions">
            <button class="dgbt-panel-button dgbt-panel-button-secondary" type="button" data-action="close-panel">Close</button>
          </div>
        </header>
        <div class="dgbt-panel-main">
          <section class="dgbt-panel-controls-column">
            <article class="dgbt-panel-card dgbt-panel-card-controls">
              <label class="dgbt-switch-row dgbt-switch-row-compact">
                <div>
                  <strong>Enable active-path threading</strong>
                  <p>Turns the active route overlay on or off.</p>
                </div>
                <input type="checkbox" data-setting="threadingEnabled">
              </label>
              <section class="dgbt-control-group dgbt-control-group-tight">
                <div class="dgbt-control-head dgbt-control-head-accent">
                  <span data-role="panel-accent-label">${escapeHtml(getAccentSelectionLabel())}</span>
                </div>
                <div class="dgbt-accent-palette-group">
                  <div class="dgbt-accent-palette-label">Preset colors</div>
                  <div class="dgbt-accent-swatch-grid">
                    ${buildAccentPresetButtons("preset")}
                  </div>
                </div>
                <div class="dgbt-accent-palette-group">
                  <div class="dgbt-accent-palette-label">Accent colors</div>
                  <div class="dgbt-accent-swatch-grid dgbt-accent-swatch-grid-wide">
                    ${buildAccentPresetButtons("accent")}
                  </div>
                </div>
                <div class="dgbt-color-row">
                  <input class="dgbt-color-input" type="color" data-setting="accentColor">
                  <input class="dgbt-text-input" type="text" inputmode="text" data-setting="accentHex" placeholder="#1f7ae0">
                </div>
                <div class="dgbt-control-help">Pick a preset like Degrande Colors, or adjust the custom color inputs to switch back to a custom accent.</div>
              </section>
              <section class="dgbt-control-group">
                <div class="dgbt-control-head">
                  <strong>Thread width</strong>
                </div>
                <div class="dgbt-choice-row dgbt-choice-row-width">
                  ${THREAD_WIDTH_CHOICES.map((choice) => `
                    <label class="dgbt-choice-pill">
                      <input type="radio" name="dgbt-thread-width" value="${choice}" data-setting="threadWidth">
                      <span>${choice}</span>
                    </label>
                  `).join("")}
                </div>
              </section>
              <section class="dgbt-control-group">
                <div class="dgbt-control-head">
                  <strong>Motion level</strong>
                </div>
                <div class="dgbt-choice-row dgbt-choice-row-motion">
                  ${MOTION_CHOICES.map((choice) => `
                    <button class="dgbt-choice-button" type="button" data-action="set-motion" data-value="${choice}">${choice}</button>
                  `).join("")}
                </div>
              </section>
              <section class="dgbt-control-group">
                <div class="dgbt-control-head">
                  <strong>Thread shape</strong>
                </div>
                <div class="dgbt-choice-row dgbt-choice-row-shape">
                  ${THREAD_SHAPE_CHOICES.map((choice) => `
                    <button class="dgbt-choice-button${choice === "Extra Rounded" ? " dgbt-extra-rounded-only" : ""}" type="button" data-action="set-thread-shape" data-value="${choice}">${choice === "Extra Rounded" ? "Extra" : choice}</button>
                  `).join("")}
                </div>
              </section>
              <section class="dgbt-control-group">
                <div class="dgbt-control-head">
                  <strong>Thread end</strong>
                </div>
                <div class="dgbt-choice-row dgbt-choice-row-end">
                  ${THREAD_END_SETTING_CHOICES.map((choice) => `
                    <button class="dgbt-choice-button" type="button" data-action="set-thread-end" data-value="${choice}">${choice}</button>
                  `).join("")}
                </div>
              </section>
            </article>
          </section>
        </div>
      </section>
    </div>
  `;
}

function syncPanelState() {
  if (!state.panelMounted || !logseq.isMainUIVisible) {
    return;
  }

  const enabledInput = document.querySelector("[data-setting='threadingEnabled']");
  const accentInput = document.querySelector("[data-setting='accentColor']");
  const accentHexInput = document.querySelector("[data-setting='accentHex']");

  if (enabledInput) {
    enabledInput.checked = state.enabled;
  }

  if (accentInput) {
    accentInput.value = getResolvedAccentPreviewColor();
  }

  if (accentHexInput && accentHexInput !== document.activeElement) {
    accentHexInput.value = getResolvedAccentPreviewColor();
  }

  document.querySelectorAll("[data-action='set-accent-preset']").forEach((button) => {
    button.style.setProperty("--dgbt-swatch-color", getPresetDisplayColor(button.dataset.value));
    button.classList.toggle(
      "is-active",
      state.accentColorMode === "preset" && button.dataset.value === state.accentPresetToken
    );
  });

  document.querySelectorAll("[data-setting='threadWidth']").forEach((input) => {
    input.checked = input.value === state.threadWidth;
  });

  document.querySelectorAll("[data-action='set-motion']").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === state.motionLevel);
  });

  const isOriginalEnd = state.threadEnd === "Original";
  document.querySelectorAll("[data-action='set-thread-shape']").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === state.threadShape);
    if (button.classList.contains("dgbt-extra-rounded-only")) {
      button.style.display = isOriginalEnd ? "" : "none";
    }
  });
  const shapeRow = document.querySelector(".dgbt-choice-row-shape");
  if (shapeRow) {
    shapeRow.classList.toggle("dgbt-choice-row-shape-3", isOriginalEnd);
  }

  document.querySelectorAll("[data-action='set-thread-end']").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === state.threadEnd);
  });

  const statusText = document.querySelector("[data-role='panel-status-text']");
  const motionPill = document.querySelector("[data-role='panel-motion-pill']");
  const widthPill = document.querySelector("[data-role='panel-width-pill']");
  const accentLabel = document.querySelector("[data-role='panel-accent-label']");
  const threadPreview = document.querySelector("[data-role='panel-thread-preview']");

  if (statusText) {
    statusText.textContent = state.enabled ? "Threading active" : "Threading paused";
  }

  if (motionPill) {
    motionPill.textContent = `${state.motionLevel} motion`;
  }

  if (widthPill) {
    widthPill.textContent = `${state.threadWidth} thread width`;
  }

  if (accentLabel) {
    accentLabel.textContent = getAccentSelectionLabel();
  }

  document.documentElement.style.setProperty("--dgbt-panel-preview-accent", getResolvedAccentPreviewColor());
  document.documentElement.style.setProperty("--dgbt-panel-thread-width", state.threadWidth);
  document.documentElement.style.setProperty("--dgbt-panel-motion-duration", getMotionTiming());
  getRainbowPaletteColors().forEach((color, index) => {
    document.documentElement.style.setProperty(`--dgbt-rainbow-${index}`, color);
  });

  if (threadPreview) {
    threadPreview.dataset.motion = state.motionLevel.toLowerCase();
    threadPreview.dataset.accentMode = isRainbowAccentMode() ? "rainbow" : "solid";
    threadPreview.dataset.shape = getThreadShapeToken();
    threadPreview.dataset.end = getThreadEndToken();
    threadPreview.classList.toggle("is-paused", !state.enabled);
  }
}

function mountPanel() {
  if (state.panelMounted) {
    return;
  }

  const app = document.getElementById("app");

  if (!app) {
    throw new Error("Missing #app root for Degrande Bullet Threading panel");
  }

  app.innerHTML = buildPanelMarkup();

  app.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");

    if (!actionTarget) {
      return;
    }

    const action = actionTarget.dataset.action;

    if (action === "close-panel") {
      closeThreadingSettings();
      return;
    }

    if (action === "set-motion") {
      setMotionLevel(actionTarget.dataset.value);
      syncPanelState();
      return;
    }

    if (action === "set-thread-shape") {
      setThreadShape(actionTarget.dataset.value);
      syncPanelState();
      return;
    }

    if (action === "set-thread-end") {
      setThreadEnd(actionTarget.dataset.value);
      if (state.threadEnd !== "Original" && state.threadShape === "Extra Rounded") {
        setThreadShape("Rounded");
      }
      syncPanelState();
      return;
    }

    if (action === "set-accent-preset") {
      setAccentPreset(actionTarget.dataset.value);
      syncPanelState();
      return;
    }
  });

  app.addEventListener("change", (event) => {
    const target = event.target;

    if (target.matches("[data-setting='threadingEnabled']")) {
      setThreadingEnabled(target.checked);
      syncPanelState();
      return;
    }

    if (target.matches("[data-setting='accentColor']")) {
      setAccentColor(target.value);
      syncPanelState();
      return;
    }

    if (target.matches("[data-setting='threadWidth']")) {
      setThreadWidth(target.value);
      syncPanelState();
      return;
    }

    if (target.matches("[data-setting='accentHex']")) {
      if (isHexColorValue(target.value)) {
        const normalized = sanitizeHexColor(target.value);
        target.value = normalized;
        setAccentColor(normalized);
      } else {
        target.value = state.accentColor;
      }
      syncPanelState();
    }
  });

  app.addEventListener("input", (event) => {
    const target = event.target;

    if (target.matches("[data-setting='accentColor']")) {
      setAccentColor(target.value);
      syncPanelState();
      return;
    }

    if (target.matches("[data-setting='accentHex']")) {
      if (isHexColorValue(target.value)) {
        setAccentColor(target.value.trim());
        syncPanelState();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && logseq.isMainUIVisible) {
      closeThreadingSettings();
    }
  });

  state.panelMounted = true;
  syncPanelState();
}

function openThreadingSettings() {
  if (!state.panelMounted) {
    mountPanel();
  }

  logseq.setMainUIInlineStyle(MAIN_UI_INLINE_STYLE);
  logseq.showMainUI({ autoFocus: true });
  syncPanelState();
}

function closeThreadingSettings() {
  logseq.setMainUIInlineStyle({});
  logseq.hideMainUI({ restoreEditingCursor: true });
}

function syncThreadingHostState() {
  const hostDocument = getHostDocument();

  const accentCssValue = getResolvedAccentCssValue();
  const rainbowCssVariables = getRainbowPaletteColors()
    .map((color, index) => `      --dgbt-rainbow-${index}: ${color};`)
    .join("\n");
  const runtimeStyle = `
    :root {
      --dgbt-thread-width: ${state.threadWidth};
      --dgbt-thread-accent: ${accentCssValue};
      --dgbt-thread-guideline-color: color-mix(in srgb, ${accentCssValue} 20%, var(--ls-guideline-color, rgba(148, 163, 184, 0.48)));
      --dgbt-thread-soft-color: color-mix(in srgb, ${accentCssValue} 38%, transparent);
      --dgbt-thread-active-color: color-mix(in srgb, ${accentCssValue} 86%, white 14%);
      --dgbt-thread-bullet-color: color-mix(in srgb, ${accentCssValue} 62%, var(--ls-block-bullet-color, rgba(148, 163, 184, 0.84)));
      --dgbt-thread-motion-duration: ${getMotionTiming()};
${rainbowCssVariables}
    }
    .dgbt-collapse-btn {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      opacity: 0;
      color: white;
      border: none;
      cursor: pointer;
      padding: 0;
      z-index: 2;
      transition: opacity 150ms ease, transform 120ms ease;
    }
    .dgbt-collapse-btn.is-visible {
      opacity: 1;
      pointer-events: auto;
    }
    .dgbt-collapse-btn.is-visible:hover {
      transform: scale(1.15);
    }
    .dgbt-collapse-btn svg {
      transition: transform 180ms ease;
      transform: rotate(0deg);
      transform-origin: 50% 50%;
    }
    .dgbt-collapse-btn.is-expanded svg {
      transform: rotate(90deg);
    }
    .dgbt-overlay.is-hidden .dgbt-collapse-btn {
      display: none;
    }
  `;

  if (runtimeStyle !== state.lastRuntimeStyleText) {
    try {
      let styleElement = hostDocument.getElementById(RUNTIME_STYLE_ELEMENT_ID);

      if (!styleElement) {
        styleElement = hostDocument.createElement("style");
        styleElement.id = RUNTIME_STYLE_ELEMENT_ID;
        (hostDocument.head || hostDocument.documentElement).appendChild(styleElement);
      }

      styleElement.textContent = runtimeStyle;
    } catch (error) {
      if (typeof logseq.provideStyle === "function") {
        logseq.provideStyle(runtimeStyle);
      } else {
        console.error("[Degrande Bullet Threading] Failed to apply runtime accent style", error);
      }
    }
    state.lastRuntimeStyleText = runtimeStyle;
  }

  const shouldApplyThreadingClass = state.enabled;

  if (state.lastEnabledClassState !== shouldApplyThreadingClass) {
    hostDocument.documentElement?.classList.toggle(THREADING_STATE_CLASS, shouldApplyThreadingClass);
    hostDocument.body?.classList.toggle(THREADING_STATE_CLASS, shouldApplyThreadingClass);
    state.lastEnabledClassState = shouldApplyThreadingClass;
  }

  hostDocument.documentElement?.setAttribute("data-dgbt-motion", state.motionLevel.toLowerCase());
  hostDocument.documentElement?.setAttribute("data-dgbt-thread-shape", getThreadShapeToken());
}

function updateToolbarUi() {
  const toolbar = getHostDocument().getElementById(TOOLBAR_TOGGLE_ID);

  if (!toolbar) {
    return;
  }

  const label = state.enabled
    ? "Open Degrande Bullet Threading settings"
    : "Open Degrande Bullet Threading settings (threading paused)";

  toolbar.classList.toggle("is-active", state.enabled);
  toolbar.setAttribute("title", label);
  toolbar.setAttribute("aria-label", label);
}

function getOverlayAnchorElement() {
  const hostDocument = getHostDocument();
  return hostDocument.getElementById(MAIN_CONTENT_CONTAINER_ID)
    || hostDocument.querySelector(".cp__sidebar-main-content")
    || hostDocument.body;
}

function ensureOverlayRoot() {
  const anchor = getOverlayAnchorElement();

  if (!anchor) {
    return null;
  }

  if (state.overlayAnchor && state.overlayAnchor !== anchor) {
    state.overlayAnchor.classList.remove(OVERLAY_ANCHOR_CLASS);
  }

  state.overlayAnchor = anchor;
  state.overlayAnchor.classList.add(OVERLAY_ANCHOR_CLASS);

  if (state.overlayRoot && state.overlayRoot.isConnected && state.overlayRoot.parentElement === anchor) {
    return state.overlayRoot;
  }

  const hostDocument = getHostDocument();
  let overlayRoot = hostDocument.getElementById(OVERLAY_ROOT_ID);

  if (!overlayRoot) {
    overlayRoot = hostDocument.createElement("div");
    overlayRoot.id = OVERLAY_ROOT_ID;
    overlayRoot.className = "dgbt-overlay is-hidden";
    overlayRoot.innerHTML = `
      <svg class="dgbt-overlay-svg" aria-hidden="true" focusable="false">
        <g class="dgbt-overlay-segments"></g>
        <path class="dgbt-overlay-path dgbt-overlay-path-core"></path>
      </svg>
      <div class="dgbt-collapse-layer"></div>
    `;
    anchor.appendChild(overlayRoot);
  } else if (overlayRoot.parentElement !== anchor) {
    anchor.appendChild(overlayRoot);
  }

  state.overlayRoot = overlayRoot;
  state.overlaySvg = overlayRoot.querySelector(".dgbt-overlay-svg");
  state.overlaySegments = overlayRoot.querySelector(".dgbt-overlay-segments");
  state.overlayCorePath = overlayRoot.querySelector(".dgbt-overlay-path-core");
  state.collapseLayer = overlayRoot.querySelector(".dgbt-collapse-layer");

  if (!state.overlaySegments && state.overlaySvg) {
    state.overlaySegments = hostDocument.createElementNS("http://www.w3.org/2000/svg", "g");
    state.overlaySegments.setAttribute("class", "dgbt-overlay-segments");
    state.overlaySvg.insertBefore(state.overlaySegments, state.overlayCorePath || null);
  }

  return overlayRoot;
}

function clearOverlayPath() {
  if (!state.overlayRoot) {
    clearRainbowBulletStyles();
    return;
  }

  state.overlayRoot.classList.add("is-hidden");
  state.overlayCorePath?.setAttribute("d", "");
  if (state.overlaySegments) {
    state.overlaySegments.innerHTML = "";
  }
  cleanupCollapseHoverListeners();
  if (state.collapseLayer) {
    state.collapseLayer.innerHTML = "";
  }
  state.collapseBlockRefs = [];
  state.collapseButtonMap = {};
  clearRainbowBulletStyles();
}

function findParentBlock(blockElement) {
  let node = blockElement?.parentElement || null;

  while (node) {
    if (node.classList?.contains("ls-block")) {
      if (isBlockInProperties(node)) {
        node = node.parentElement;
        continue;
      }

      return node;
    }

    node = node.parentElement;
  }

  return null;
}

function isBlockInProperties(blockElement) {
  return Boolean(blockElement?.closest?.(PROPERTY_CONTAINER_SELECTOR));
}

function findActiveBlockElement() {
  const hostDocument = getHostDocument();
  const activeElement = hostDocument.activeElement;
  const focusedBlock = activeElement?.closest?.(".ls-block");

  if (focusedBlock) {
    return isBlockInProperties(focusedBlock) ? null : focusedBlock;
  }

  const selectedBlock = hostDocument.querySelector(".ls-block.selected-block, .ls-block.selected") || null;
  return isBlockInProperties(selectedBlock) ? null : selectedBlock;
}

function getBlockBulletElement(blockElement) {
  if (!blockElement || isBlockInProperties(blockElement)) {
    return null;
  }

  const directBulletContainer = blockElement.querySelector(":scope > div > :is(div.items-center, div.block-control-wrap) .bullet-container");

  if (directBulletContainer) {
    return directBulletContainer;
  }

  const directBullet = blockElement.querySelector(":scope > div > :is(div.items-center, div.block-control-wrap) .bullet");

  if (directBullet) {
    return directBullet.parentElement || directBullet;
  }

  const candidates = blockElement.querySelectorAll(".bullet-container, .bullet");

  for (const candidate of candidates) {
    if (candidate.closest(".ls-block") === blockElement) {
      return candidate.classList.contains("bullet")
        ? candidate.parentElement || candidate
        : candidate;
    }
  }

  return null;
}

function getBlockControlElement(blockElement) {
  if (!blockElement || isBlockInProperties(blockElement)) {
    return null;
  }

  for (const child of Array.from(blockElement.children || [])) {
    if (child.matches?.("div.items-center, div.block-control-wrap")) {
      return child;
    }

    const nestedControl = child.querySelector?.(":scope > :is(div.items-center, div.block-control-wrap)");

    if (nestedControl) {
      return nestedControl;
    }
  }

  return null;
}

function getOwnBlockChildrenContainer(blockElement) {
  if (!blockElement) {
    return null;
  }

  for (const child of Array.from(blockElement.children || [])) {
    if (child.classList?.contains("block-children")) {
      return child;
    }

    const nestedChildren = child.querySelector?.(":scope > .block-children");

    if (nestedChildren) {
      return nestedChildren;
    }
  }

  return null;
}

function getNativeCollapseState(blockElement) {
  if (!blockElement) {
    return {
      isCollapsible: false,
      isCollapsed: false,
    };
  }

  const controlElement = getBlockControlElement(blockElement);
  const childContainer = getOwnBlockChildrenContainer(blockElement);
  const hasChildAttribute = blockElement.getAttribute("haschild") === "true";
  const hasNoChildAttribute = blockElement.getAttribute("haschild") === "false";
  const hasExpandedChildren = hasChildAttribute || Boolean(childContainer && childContainer.childElementCount > 0);
  const bulletWrap = controlElement?.querySelector(".bullet-link-wrap");
  const bulletState = bulletWrap?.getAttribute("data-state") || "";
  const hasNotCollapsedArrow = Boolean(controlElement?.querySelector(".rotating-arrow.not-collapsed"));
  const hasCollapsedArrow = Boolean(controlElement?.querySelector(".rotating-arrow.collapsed"));
  const hasClosedBullet = Boolean(controlElement?.querySelector(".bullet-container.bullet-closed, .bullet-closed"));
  const hasClosedMarker = Boolean(bulletWrap && bulletState === "closed" && !hasNotCollapsedArrow);

  if (hasCollapsedArrow || hasClosedBullet || hasClosedMarker) {
    return {
      isCollapsible: true,
      isCollapsed: true,
    };
  }

  if (hasExpandedChildren) {
    return {
      isCollapsible: true,
      isCollapsed: false,
    };
  }

  if (hasNoChildAttribute) {
    return {
      isCollapsible: false,
      isCollapsed: false,
    };
  }

  return {
    isCollapsible: false,
    isCollapsed: false,
  };
}

function isBlockCollapsible(blockElement) {
  return getNativeCollapseState(blockElement).isCollapsible;
}

function isBlockCurrentlyCollapsed(blockElement) {
  return getNativeCollapseState(blockElement).isCollapsed;
}

function getBlockCollapseControlElement(blockElement) {
  if (!blockElement || isBlockInProperties(blockElement)) {
    return null;
  }

  const controlElement = getBlockControlElement(blockElement);

  if (!controlElement) {
    return null;
  }

  if (controlElement.classList?.contains("block-control")) {
    return controlElement;
  }

  return controlElement.querySelector(".block-control");
}

function getBlockBulletVisualElement(blockElement) {
  if (!blockElement || isBlockInProperties(blockElement)) {
    return null;
  }

  return blockElement.querySelector(":scope > div > :is(div.items-center, div.block-control-wrap) .bullet")
    || blockElement.querySelector(".bullet");
}

function getBlockGuideElement(blockElement) {
  if (!blockElement || isBlockInProperties(blockElement)) {
    return null;
  }

  const selectors = [
    ":scope > .block-children-container .block-children-left-border",
    ":scope > .block-children-left-border",
    ":scope > .block-children-container .block-children",
    ":scope > .block-children",
  ];

  for (const selector of selectors) {
    const candidate = blockElement.querySelector(selector);

    if (candidate && candidate.closest(".ls-block") === blockElement) {
      return candidate;
    }
  }

  const fallbacks = blockElement.querySelectorAll(".block-children, .block-children-left-border");
  for (const candidate of fallbacks) {
    if (candidate.closest(".ls-block") === blockElement) {
      return candidate;
    }
  }

  return null;
}

function getGuideXForBlock(blockElement, anchor) {
  const guideElement = getBlockGuideElement(blockElement);

  if (!guideElement || !anchor) {
    return null;
  }

  const rect = guideElement.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();

  if (rect.width <= 0 && rect.height <= 0) {
    return null;
  }

  const isGuideBorder = guideElement.classList.contains("block-children-left-border");
  if (isGuideBorder) {
    return rect.left - anchorRect.left + anchor.scrollLeft + (rect.width / 2);
  }

  const hostWindow = getHostWindow();
  const borderLeftWidth = Number.parseFloat(hostWindow?.getComputedStyle?.(guideElement)?.borderLeftWidth || "1") || 1;
  return rect.left - anchorRect.left + anchor.scrollLeft + (borderLeftWidth / 2);
}

function clearRainbowBulletStyles() {
  const hostDocument = getHostDocument();
  const knownBullets = new Set(state.rainbowBulletElements);

  hostDocument.querySelectorAll?.('.bullet[data-dgbt-thread-bullet="true"]').forEach((bulletElement) => {
    knownBullets.add(bulletElement);
  });

  knownBullets.forEach((bulletElement) => {
    if (!bulletElement) {
      return;
    }

    bulletElement.style.removeProperty("background-color");
    bulletElement.style.removeProperty("border-color");
    bulletElement.style.removeProperty("color");
    bulletElement.style.removeProperty("fill");
    bulletElement.style.removeProperty("box-shadow");
    bulletElement.style.removeProperty("--dgbt-bullet-color");
    bulletElement.removeAttribute("data-dgbt-thread-bullet");
  });

  state.rainbowBulletElements = [];
}

function applyRainbowBulletStyles(blockChain) {
  clearRainbowBulletStyles();

  blockChain.forEach((blockElement, index) => {
    const bulletElement = getBlockBulletVisualElement(blockElement);

    if (!bulletElement) {
      return;
    }

    let color;
    if (isRainbowAccentMode()) {
      color = getRainbowSegmentColor(Math.max(0, index - 1));
    } else {
      const accentCssValue = getResolvedAccentCssValue();
      color = `color-mix(in srgb, ${accentCssValue} 86%, white 14%)`;
    }
    
    // Assign explicit styles inline to bypass recent Logseq DB CSS overrides
    bulletElement.style.setProperty("--dgbt-bullet-color", color);
    bulletElement.style.setProperty("background-color", color, "important");
    bulletElement.style.setProperty("border-color", color, "important");
    bulletElement.style.setProperty("color", color, "important");
    bulletElement.style.setProperty("fill", color, "important");
    bulletElement.setAttribute("data-dgbt-thread-bullet", "true");
    
    state.rainbowBulletElements.push(bulletElement);
  });
}

function getBlockPathChain(activeBlockElement) {
  const chain = [];
  let currentBlock = activeBlockElement;

  while (currentBlock) {
    if (!isBlockInProperties(currentBlock)) {
      chain.unshift(currentBlock);
    }

    currentBlock = findParentBlock(currentBlock);
  }

  return chain;
}

function getPointForBlock(blockElement) {
  const anchor = state.overlayAnchor || getOverlayAnchorElement();
  const bulletElement = getBlockBulletElement(blockElement);
  const bulletVisualElement = getBlockBulletVisualElement(blockElement);
  const controlElement = getBlockControlElement(blockElement);
  const collapseControlElement = getBlockCollapseControlElement(blockElement);

  if (!bulletElement || !anchor) {
    return null;
  }

  const rect = bulletElement.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  const visualRect = bulletVisualElement?.getBoundingClientRect?.();
  const radiusSource = visualRect && visualRect.width > 0 && visualRect.height > 0
    ? Math.min(visualRect.width, visualRect.height)
    : Math.min(rect.width, rect.height);
  const positionRect = visualRect && visualRect.width > 0 && visualRect.height > 0
    ? visualRect
    : rect;
  let endBox = null;

  if (state.threadEnd === "Bouble") {
    const rects = [];
    const collectRect = (element) => {
      if (!element) {
        return;
      }

      const elementRect = element.getBoundingClientRect();

      if (elementRect.width <= 0 && elementRect.height <= 0) {
        return;
      }

      rects.push({
        left: elementRect.left - anchorRect.left + anchor.scrollLeft,
        right: elementRect.right - anchorRect.left + anchor.scrollLeft,
        top: elementRect.top - anchorRect.top + anchor.scrollTop,
        bottom: elementRect.bottom - anchorRect.top + anchor.scrollTop,
      });
    };

    collectRect(collapseControlElement);
    collectRect(bulletElement);

    if (bulletVisualElement && bulletVisualElement !== bulletElement) {
      collectRect(bulletVisualElement);
    }

    if (!rects.length && controlElement) {
      collectRect(controlElement);
    }

    if (rects.length) {
      const boxPaddingX = 0;
      const boxPaddingY = -1;
      const minWidth = 14;
      const minHeight = 12;
      const boxOffsetY = -1;
      const boxHeightAdjust = -2;
      let left = Math.min(...rects.map((candidate) => candidate.left)) - boxPaddingX + 4;
      let right = Math.max(...rects.map((candidate) => candidate.right)) + boxPaddingX - 1;
      let top = Math.min(...rects.map((candidate) => candidate.top)) - boxPaddingY;
      let bottom = Math.max(...rects.map((candidate) => candidate.bottom)) + boxPaddingY;
      const width = right - left;
      const height = bottom - top;

      if (width < minWidth) {
        right += minWidth - width;
      }

      if (height < minHeight) {
        const extra = minHeight - height;
        top -= extra / 2;
        bottom += extra / 2;
      }

      top += boxOffsetY;
      bottom += boxOffsetY + boxHeightAdjust;

      endBox = {
        left,
        right,
        top,
        bottom,
      };
    }
  }

  return {
    x: positionRect.left - anchorRect.left + anchor.scrollLeft + (positionRect.width / 2),
    y: positionRect.top - anchorRect.top + anchor.scrollTop + (positionRect.height / 2) - 1,
    radius: Math.max(3, radiusSource / 2),
    guideX: getGuideXForBlock(blockElement, anchor),
    endBox,
  };
}

function buildSegmentGeometry(previous, current) {
  const deltaY = current.y - previous.y;
  const threadWidthValue = Number.parseFloat(state.threadWidth) || 0;
  const endpointGap = Math.max(2, threadWidthValue * 0.5);
  const startEndpointGap = Math.max(0, threadWidthValue * 0.75);
  const isRounded = state.threadShape === "Rounded" || state.threadShape === "Extra Rounded";
  const capCompensation = isRounded
    ? threadWidthValue / 2
    : 0;
  const previousRadius = Math.max(0, Number(previous.radius) || 0) + capCompensation + startEndpointGap;
  const currentRadius = Math.max(0, Number(current.radius) || 0) + capCompensation + endpointGap;
  const directionY = deltaY === 0 ? 0 : Math.sign(deltaY);
  const verticalX = Number.isFinite(previous.guideX) ? previous.guideX : previous.x;
  const directionFromGuide = current.x === verticalX ? 0 : Math.sign(current.x - verticalX);
  const endMode = state.threadEnd; // "Top", "Side", "Original", or "Bouble"

  // Start on the guide axis, below the source bullet
  const rawPreviousRadius = Math.max(0, Number(previous.radius) || 0);
  const startY = endMode === "Original"
    ? previous.y + (directionY * (rawPreviousRadius + 1))
    : previous.y + (directionY * previousRadius) + 4;
  const startPoint = { x: verticalX, y: startY };

  if (endMode === "Bouble" && current.endBox) {
    const boxLeft = Math.min(current.endBox.left, current.endBox.right);
    const boxRight = Math.max(current.endBox.left, current.endBox.right);
    const boxTop = Math.min(current.endBox.top, current.endBox.bottom);
    const boxBottom = Math.max(current.endBox.top, current.endBox.bottom);
    const horizontalOut = Math.abs(boxLeft - verticalX);
    const entryY = Math.max(boxTop, Math.min(current.y, boxBottom));
    const verticalSpan = Math.abs(entryY - startPoint.y);
    const boxRadius = isRounded
      ? Math.min(8, (boxRight - boxLeft) / 2, (boxBottom - boxTop) / 2)
      : 0;
    const connector = [
      `M ${startPoint.x} ${startPoint.y}`,
    ];

    if (isRounded && horizontalOut > 0 && verticalSpan > 0) {
      const r = Math.min(4, horizontalOut, verticalSpan);
      const cornerEndX = verticalX + (Math.sign(boxLeft - verticalX) * r);
      const cornerStartY = entryY - (directionY * r);

      connector.push(`L ${verticalX} ${cornerStartY}`);
      connector.push(`Q ${verticalX} ${entryY} ${cornerEndX} ${entryY}`);
      connector.push(`L ${boxLeft} ${entryY}`);
    } else {
      connector.push(`L ${verticalX} ${entryY}`);
      connector.push(`L ${boxLeft} ${entryY}`);
    }

    if (boxRadius > 0) {
      connector.push(`L ${boxLeft} ${boxTop + boxRadius}`);
      connector.push(`Q ${boxLeft} ${boxTop} ${boxLeft + boxRadius} ${boxTop}`);
      connector.push(`L ${boxRight - boxRadius} ${boxTop}`);
      connector.push(`Q ${boxRight} ${boxTop} ${boxRight} ${boxTop + boxRadius}`);
      connector.push(`L ${boxRight} ${boxBottom - boxRadius}`);
      connector.push(`Q ${boxRight} ${boxBottom} ${boxRight - boxRadius} ${boxBottom}`);
      connector.push(`L ${boxLeft + boxRadius} ${boxBottom}`);
      connector.push(`Q ${boxLeft} ${boxBottom} ${boxLeft} ${boxBottom - boxRadius}`);
      connector.push(`L ${boxLeft} ${entryY}`);
    } else {
      connector.push(`L ${boxLeft} ${boxTop}`);
      connector.push(`L ${boxRight} ${boxTop}`);
      connector.push(`L ${boxRight} ${boxBottom}`);
      connector.push(`L ${boxLeft} ${boxBottom}`);
      connector.push(`L ${boxLeft} ${entryY}`);
    }

    return {
      leadPath: "",
      bodyPath: connector.join(" "),
    };
  }

  // --- Side / Original mode: end beside the target bullet ---
  if ((endMode === "Side" || endMode === "Original") && directionFromGuide !== 0) {
    const sideStub = endMode === "Original"
      ? Math.abs(current.x - verticalX) - Math.max(0, Number(current.radius) || 0) - 2
      : 7;
    const endSide = {
      x: verticalX + (directionFromGuide * Math.max(1, sideStub)),
      y: current.y,
    };

    if (isRounded) {
      const horizontalOut = Math.abs(endSide.x - verticalX);
      const verticalSpan = Math.abs(endSide.y - startPoint.y);

      if (horizontalOut > 0 && verticalSpan > 0) {
        const isExtra = state.threadShape === "Extra Rounded";
        let rLower = isExtra ? Math.min(16, horizontalOut) : Math.min(4, horizontalOut, verticalSpan);
        if (isExtra && rLower * 2 > verticalSpan) {
          rLower = verticalSpan / 2;
        }
        const cornerEndX = verticalX + (directionFromGuide * rLower);
        const cornerStartY = current.y - (directionY * rLower);

        return {
          leadPath: "",
          bodyPath: [
          `M ${startPoint.x} ${startPoint.y}`,
          `L ${verticalX} ${cornerStartY}`,
          `Q ${verticalX} ${current.y} ${cornerEndX} ${current.y}`,
          `L ${endSide.x} ${endSide.y}`,
        ].join(" "),
        };
      }
    }

    // Square side / original
    return {
      leadPath: "",
      bodyPath: [
      `M ${startPoint.x} ${startPoint.y}`,
      `L ${verticalX} ${current.y}`,
      `L ${endSide.x} ${endSide.y}`,
    ].join(" "),
    };
  }

  // --- Top mode: end above the target bullet ---
  const endPoint = { x: current.x, y: current.y - (directionY * currentRadius) };

  if (directionFromGuide !== 0) {
    if (isRounded) {
      const horizontalOut = Math.abs(current.x - verticalX);
      const verticalSpan = Math.abs(endPoint.y - startPoint.y);

      if (horizontalOut > 0 && verticalSpan > 0) {
        const isExtra = state.threadShape === "Extra Rounded";
        const turnY = endPoint.y - (directionY * 6);
        let rUpper = isExtra ? Math.min(16, horizontalOut) : Math.min(4, horizontalOut, 6);
        let rLower = isExtra ? Math.min(16, horizontalOut) : Math.min(4, horizontalOut, 6);
        if (isExtra && rUpper + rLower > Math.abs(endPoint.y - startPoint.y)) {
          const scale = Math.abs(endPoint.y - startPoint.y) / (rUpper + rLower);
          rUpper *= scale;
          rLower *= scale;
        }
        const cornerEndX = verticalX + (directionFromGuide * rUpper);
        const cornerStartY = turnY - (directionY * rUpper);
        const corner2StartX = current.x - (directionFromGuide * rLower);
        const corner2EndY = turnY + (directionY * rLower);

        return {
          leadPath: "",
          bodyPath: [
          `M ${startPoint.x} ${startPoint.y}`,
          `L ${verticalX} ${cornerStartY}`,
          `Q ${verticalX} ${turnY} ${cornerEndX} ${turnY}`,
          `L ${corner2StartX} ${turnY}`,
          `Q ${current.x} ${turnY} ${current.x} ${corner2EndY}`,
          `L ${endPoint.x} ${endPoint.y}`,
        ].join(" "),
        };
      }
    }

    // Square top
    const turnY = endPoint.y - (directionY * 6);
    return {
      leadPath: "",
      bodyPath: [
      `M ${startPoint.x} ${startPoint.y}`,
      `L ${verticalX} ${turnY}`,
      `L ${current.x} ${turnY}`,
      `L ${endPoint.x} ${endPoint.y}`,
    ].join(" "),
    };
  }

  // Straight (no horizontal offset)
  const straightEnd = endMode === "Side"
    ? { x: current.x, y: current.y - (directionY * currentRadius) }
    : endMode === "Original"
    ? { x: current.x, y: current.y - (directionY * (Math.max(0, Number(current.radius) || 0) + 2)) }
    : endPoint;
  return {
    leadPath: "",
    bodyPath: [
    `M ${startPoint.x} ${startPoint.y}`,
    `L ${straightEnd.x} ${straightEnd.y}`,
  ].join(" "),
  };
}

function buildSegmentPath(previous, current) {
  const { leadPath, bodyPath } = buildSegmentGeometry(previous, current);
  return [leadPath, bodyPath].filter(Boolean).join(" ");
}

function buildSvgPath(points) {
  if (!points.length) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let pathData = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const segmentPath = buildSegmentPath(points[index - 1], points[index]).replace(/^M [^ ]+ [^ ]+\s*/, "");
    pathData += ` ${segmentPath}`;
  }

  return pathData;
}

function cleanupCollapseHoverListeners() {
  for (const fn of state.collapseHoverCleanups) {
    try { fn(); } catch (_) { /* ignore */ }
  }

  state.collapseHoverCleanups = [];
  state.collapseVisibleIndex = -1;
}

function showCollapseButton(index) {
  if (index === state.collapseVisibleIndex) {
    return;
  }

  if (state.collapseVisibleIndex >= 0) {
    state.collapseLayer?.querySelector(`[data-collapse-index="${state.collapseVisibleIndex}"]`)?.classList.remove("is-visible");
  }

  state.collapseVisibleIndex = index;

  if (index >= 0) {
    state.collapseLayer?.querySelector(`[data-collapse-index="${index}"]`)?.classList.add("is-visible");
  }
}

function ensureCollapseHoverListener() {
  if (state._collapseHoverBound) {
    return;
  }

  const hostDocument = getHostDocument();

  if (!hostDocument) {
    return;
  }

  let hideTimer = null;

  const scheduleHide = () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
    }

    hideTimer = setTimeout(() => {
      showCollapseButton(-1);
      hideTimer = null;
    }, 120);
  };

  const onPointerMove = (event) => {
    if (!state.collapseBlockRefs?.length) {
      showCollapseButton(-1);
      return;
    }

    const target = event.target;
    const btn = target?.closest?.(".dgbt-collapse-btn");

    if (btn) {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }

      showCollapseButton(Number(btn.dataset.collapseIndex));
      return;
    }

    const hoveredBlock = target?.closest?.(".ls-block");

    if (!hoveredBlock) {
      scheduleHide();
      return;
    }

    let check = hoveredBlock;

    while (check) {
      const idx = state.collapseBlockRefs.findIndex((ref) => ref.blockElement === check);

      if (idx >= 0) {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }

        showCollapseButton(idx);
        return;
      }

      check = check.parentElement?.closest?.(".ls-block");
    }

    scheduleHide();
  };

  hostDocument.addEventListener("pointermove", onPointerMove, { passive: true });
  state._collapseHoverBound = true;

  state.collapseHoverCleanups.push(() => {
    hostDocument.removeEventListener("pointermove", onPointerMove);
    state._collapseHoverBound = false;

    if (hideTimer) {
      clearTimeout(hideTimer);
    }
  });
}

function renderCollapseButtons(blockChain) {
  const layer = state.collapseLayer;

  if (!layer) {
    return;
  }

  if (!CUSTOM_COLLAPSE_OVERLAY_ENABLED) {
    cleanupCollapseHoverListeners();
    layer.innerHTML = "";
    state.collapseBlockRefs = [];
    state.collapseButtonMap = {};
    return;
  }

  const anchor = state.overlayAnchor || getOverlayAnchorElement();

  if (!anchor) {
    layer.innerHTML = "";
    state.collapseBlockRefs = [];
    state.collapseButtonMap = {};
    return;
  }

  const hostDoc = getHostDocument();
  const anchorRect = anchor.getBoundingClientRect();
  const refs = [];
  const isSquare = state.threadShape === "Square";
  const borderRadius = isSquare ? "2px" : "50%";
  const usedBlockIds = new Set();

  if (!state.collapseButtonMap) {
    state.collapseButtonMap = {};
  }

  for (let i = 0; i < blockChain.length; i++) {
    const blockElement = blockChain[i];

    if (!isBlockCollapsible(blockElement)) {
      continue;
    }

    const collapseControl = getBlockCollapseControlElement(blockElement);

    if (!collapseControl) {
      continue;
    }

    const controlRect = collapseControl.getBoundingClientRect();

    if (controlRect.width <= 0 || controlRect.height <= 0) {
      continue;
    }

    const blockId = blockElement.getAttribute("blockid") || "";
    const left = controlRect.left - anchorRect.left + anchor.scrollLeft + 3;
    const top = controlRect.top - anchorRect.top + anchor.scrollTop + 1;
    const width = controlRect.width - 6;
    const height = controlRect.height - 6;
    const isCollapsed = isBlockCurrentlyCollapsed(blockElement);
    const arrowLabel = isCollapsed ? "Expand" : "Collapse";
    const bgColor = isRainbowAccentMode()
      ? getRainbowSegmentColor(Math.max(0, i - 1))
      : "var(--dgbt-thread-active-color)";
    const refIndex = refs.length;

    refs.push({ blockElement, collapseControl, blockId });
    usedBlockIds.add(blockId);

    let button = state.collapseButtonMap[blockId];

    if (!button || !button.parentNode) {
      button = hostDoc.createElement("button");
      button.className = "dgbt-collapse-btn";
      button.type = "button";
      button.addEventListener("click", handleCollapseLayerClick);
      button.addEventListener("mousedown", handleCollapseLayerPointerBlock);
      button.addEventListener("pointerdown", handleCollapseLayerPointerBlock);
      button.addEventListener("pointerup", handleCollapseLayerPointerBlock);
      button.addEventListener("mouseup", handleCollapseLayerPointerBlock);
      const svg = hostDoc.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 16 16");
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
      const path = hostDoc.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M 5 3 L 11 8 L 5 13 Z");
      path.setAttribute("fill", "currentColor");
      svg.appendChild(path);
      button.appendChild(svg);
      layer.appendChild(button);
      state.collapseButtonMap[blockId] = button;
    }

    const point = getPointForBlock(blockElement);
    const buttonSize = 14;
    const guideX = Number.isFinite(point?.guideX) ? point.guideX : null;
    const buttonCenterX = guideX ?? (left + (width / 2));
    const buttonLeft = Math.max(0, Math.round(buttonCenterX - (buttonSize / 2) - 10));
    const buttonTop = Math.max(0, Math.round((top + (height / 2)) - (buttonSize / 2)));

    button.dataset.collapseIndex = String(refIndex);
    button.style.cssText = `left:${buttonLeft}px;top:${buttonTop}px;width:${buttonSize}px;height:${buttonSize}px;background:${bgColor};border-radius:${borderRadius}`;
    button.setAttribute("aria-label", arrowLabel);
    button.setAttribute("title", arrowLabel);
    button.classList.toggle("is-expanded", !isCollapsed);
  }

  // Remove stale buttons that no longer match a block in the chain.
  for (const [bid, btn] of Object.entries(state.collapseButtonMap)) {
    if (!usedBlockIds.has(bid)) {
      btn.remove();
      delete state.collapseButtonMap[bid];
    }
  }

  state.collapseBlockRefs = refs;

  cleanupCollapseHoverListeners();

  if (state.collapseVisibleIndex >= 0 && state.collapseVisibleIndex < refs.length) {
    const visBtn = layer.querySelector(`[data-collapse-index="${state.collapseVisibleIndex}"]`);
    if (visBtn) visBtn.classList.add("is-visible");
  }
}

function handleCollapseLayerPointerBlock(event) {
  if (event.target.closest(".dgbt-collapse-btn")) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function handleCollapseLayerClick(event) {
  const button = event.target.closest(".dgbt-collapse-btn");

  if (!button) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const index = Number(button.dataset.collapseIndex);
  const ref = state.collapseBlockRefs?.[index];

  if (!ref?.blockId) {
    return;
  }

  try {
    logseq.Editor.setBlockCollapsed(ref.blockId, "toggle");
  } catch (_) { /* ignore */ }
}

function buildCollapseGlyphMarkup(blockChain) {
  if (!VISUAL_COLLAPSE_GLYPHS_ENABLED) {
    return "";
  }

  const anchor = state.overlayAnchor || getOverlayAnchorElement();

  if (!anchor) {
    return "";
  }

  const anchorRect = anchor.getBoundingClientRect();

  return blockChain
    .map((blockElement, index) => {
      if (!isBlockCollapsible(blockElement)) {
        return "";
      }

      const point = getPointForBlock(blockElement);
      const collapseControl = getBlockCollapseControlElement(blockElement);

      if (!point || !collapseControl) {
        return "";
      }

      const controlRect = collapseControl.getBoundingClientRect();

      if (controlRect.width <= 0 || controlRect.height <= 0) {
        return "";
      }

      const nativeArrow = collapseControl.querySelector(".rotating-arrow");
      const nativeArrowRect = nativeArrow?.getBoundingClientRect?.();
      const anchorRectSource = nativeArrowRect && nativeArrowRect.width > 0 && nativeArrowRect.height > 0
        ? nativeArrowRect
        : controlRect;
      const glyphX = Math.round(anchorRectSource.left - anchorRect.left + anchor.scrollLeft + (anchorRectSource.width / 2));
      const glyphY = Math.round(anchorRectSource.top - anchorRect.top + anchor.scrollTop + (anchorRectSource.height / 2));
      const rotation = isBlockCurrentlyCollapsed(blockElement) ? 0 : 90;
      const glyphColor = isRainbowAccentMode()
        ? getRainbowSegmentColor(Math.max(0, index - 1))
        : "var(--dgbt-thread-active-color)";

      return `<g class="dgbt-overlay-collapse-glyph" transform="translate(${glyphX} ${glyphY}) rotate(${rotation})" style="color:${glyphColor}"><circle class="dgbt-overlay-collapse-chip" cx="0" cy="0" r="7"></circle><path class="dgbt-overlay-collapse-arrow" d="M -2.5 -4 L 3.5 0 L -2.5 4 Z"></path></g>`;
    })
    .join("");
}

function renderOverlayPath() {
  const overlayRoot = ensureOverlayRoot();

  if (!overlayRoot) {
    return;
  }

  if (!state.enabled) {
    clearOverlayPath();
    return;
  }

  const activeBlock = findActiveBlockElement();

  if (!activeBlock) {
    clearOverlayPath();
    return;
  }

  const blockChain = getBlockPathChain(activeBlock);
  const points = blockChain
    .map((blockElement) => getPointForBlock(blockElement))
    .filter(Boolean);

  if (!points.length) {
    clearOverlayPath();
    return;
  }

  const pathData = buildSvgPath(points);

  if (!pathData) {
    clearOverlayPath();
    return;
  }

  state.overlayRoot.classList.remove("is-hidden");
  applyRainbowBulletStyles(blockChain);
  renderCollapseButtons(blockChain);
  const collapseGlyphMarkup = buildCollapseGlyphMarkup(blockChain);

  if (points.length > 1 && state.overlaySegments) {
    state.overlayCorePath?.setAttribute("d", "");
    const strokeWidth = state.threadWidth;
    state.overlaySegments.innerHTML = points
      .slice(1)
      .map((point, index) => {
        const { leadPath, bodyPath } = buildSegmentGeometry(points[index], point);
        const segmentStroke = isRainbowAccentMode()
          ? getRainbowSegmentColor(index)
          : "var(--dgbt-thread-active-color)";
        return [
          leadPath
            ? `<path class="dgbt-overlay-path dgbt-overlay-path-lead" d="${leadPath}" style="stroke:${segmentStroke};stroke-width:${strokeWidth}"></path>`
            : "",
          `<path class="dgbt-overlay-path dgbt-overlay-path-segment" d="${bodyPath}" style="stroke:${segmentStroke};stroke-width:${strokeWidth}"></path>`,
        ].join("");
      })
      .join("") + collapseGlyphMarkup;
    return;
  }

  if (state.overlaySegments) {
    state.overlaySegments.innerHTML = collapseGlyphMarkup;
  }

  state.overlayCorePath?.setAttribute("d", pathData);
  state.overlayCorePath?.style.setProperty("stroke-width", state.threadWidth);
}

function bindHostObservers() {
  if (state.hostObserver) {
    return;
  }

  const hostDocument = getHostDocument();
  const hostWindow = getHostWindow();
  const observedRoot = getOverlayAnchorElement() || hostDocument.body;

  if (typeof MutationObserver === "function" && observedRoot) {
    state.hostObserver = new MutationObserver((mutationList) => {
      const hasRelevantMutation = mutationList.some((mutation) => {
        const targetNode = mutation.target;

        if (!targetNode || typeof targetNode.nodeType !== "number") {
          return false;
        }

        if (state.overlayRoot && (state.overlayRoot === targetNode || state.overlayRoot.contains(targetNode))) {
          return false;
        }

        return true;
      });

      if (hasRelevantMutation) {
        queueRender();
      }
    });

    state.hostObserver.observe(observedRoot, {
      subtree: true,
      childList: true,
    });
  }

  hostDocument.addEventListener("selectionchange", queueRender, true);
  hostDocument.addEventListener("focusin", queueRender, true);
  hostDocument.addEventListener("pointerup", queueRender, true);
  hostDocument.addEventListener("keyup", queueRender, true);
  registerCleanup(() => hostDocument.removeEventListener("selectionchange", queueRender, true));
  registerCleanup(() => hostDocument.removeEventListener("focusin", queueRender, true));
  registerCleanup(() => hostDocument.removeEventListener("pointerup", queueRender, true));
  registerCleanup(() => hostDocument.removeEventListener("keyup", queueRender, true));

  hostWindow.addEventListener("resize", queueRender);
  registerCleanup(() => hostWindow.removeEventListener("resize", queueRender));
}

function updatePagebarUi() {
  const root = getHostDocument().getElementById(PAGEBAR_ROOT_ID);

  if (!root) {
    return;
  }

  root.style.setProperty("--dgbt-accent", getResolvedAccentCssValue());
  root.dataset.motion = state.motionLevel.toLowerCase();
  root.dataset.accentMode = isRainbowAccentMode() ? "rainbow" : "solid";
  root.dataset.shape = getThreadShapeToken();
  root.classList.toggle("is-paused", !state.enabled);

  const status = root.querySelector('[data-role="status-text"]');
  const motion = root.querySelector('[data-role="motion-text"]');

  if (status) {
    status.textContent = state.enabled ? "Threading active" : "Threading paused";
  }

  if (motion) {
    motion.textContent = `${state.motionLevel} motion · ${state.threadWidth}`;
  }
}

function queueRender() {
  if (state.renderTimer) {
    cancelAnimationFrame(state.renderTimer);
  }

  state.renderTimer = requestAnimationFrame(() => {
    state.renderTimer = null;

    syncThreadingHostState();
    updateToolbarUi();
    renderOverlayPath();
    syncPanelState();
  });
}

function toggleThreadingEnabled() {
  setThreadingEnabled(!state.enabled);
}

function registerCommands(pluginId) {
  registerCommandPaletteSafely(
    {
      key: `${pluginId}/toggle-threading-preview`,
      label: "Degrande Bullet Threading: toggle preview",
    },
    () => {
      toggleThreadingEnabled();
    }
  );

  registerCommandPaletteSafely(
    {
      key: `${pluginId}/open-threading-settings`,
      label: "Degrande Bullet Threading: open settings",
    },
    () => {
      openThreadingSettings();
    }
  );

  registerCommandPaletteSafely(
    {
      key: `${pluginId}/refresh-threading-styles`,
      label: "Degrande Bullet Threading: refresh styles",
    },
    () => {
      queueRender();
    }
  );
}

function bindAppEvents() {
  if (typeof logseq.App.onRouteChanged === "function") {
    const disposeRouteChanged = logseq.App.onRouteChanged(() => {
      queueRender();
    });
    registerCleanup(disposeRouteChanged);
  }

  if (typeof logseq.App.onThemeModeChanged === "function") {
    const disposeThemeModeChanged = logseq.App.onThemeModeChanged(() => {
      queueRender();
    });
    registerCleanup(disposeThemeModeChanged);
  }
}

async function main() {
  const isDbGraph = typeof logseq.App.checkCurrentIsDbGraph === "function"
    ? await logseq.App.checkCurrentIsDbGraph()
    : false;
  state.isDbGraph = Boolean(isDbGraph);

  if (!state.isDbGraph) {
    await logseq.UI.showMsg("Degrande Bullet Threading currently targets Logseq DB graphs only.", "warning", { timeout: 3200 });
    return;
  }

  if (typeof logseq.useSettingsSchema === "function") {
    logseq.useSettingsSchema(SETTINGS_SCHEMA);
  }

  applyPluginSettings(logseq.settings || {});

  if (typeof logseq.onSettingsChanged === "function") {
    logseq.onSettingsChanged((newSettings) => {
      if (Date.now() - state.settingsSelfUpdate < 500) {
        return;
      }

      applyPluginSettings(newSettings || {});
      queueRender();
    });
  }

  await installStyles();
  removePagebarUi();

  logseq.provideModel({
    toggleThreadingEnabled() {
      toggleThreadingEnabled();
    },
    openThreadingSettings() {
      openThreadingSettings();
    },
    closeThreadingSettings() {
      closeThreadingSettings();
    },
  });

  registerUiItemSafely("toolbar", TOOLBAR_REGISTRY_KEY, {
    key: TOOLBAR_ITEM_KEY,
    template: `
      <a class="button" id="${TOOLBAR_TOGGLE_ID}" data-on-click="openThreadingSettings" title="Open Degrande Bullet Threading settings" aria-label="Open Degrande Bullet Threading settings">
        <i class="ti ti-git-branch"></i>
      </a>
    `,
  });

  registerCommands(logseq.baseInfo.id);
  bindAppEvents();
  bindHostObservers();
  queueRender();
}

window.__degrandeBulletThreadingMain = main;
window[CLEANUP_REGISTRY_KEY] = cleanupPluginRuntime;
})();

