(() => {
const FALLBACK_PLUGIN_VERSION = "0.1.1";
const PAGEBAR_ITEM_KEY = "degrande-bullet-threading-pagebar";
const TOOLBAR_ITEM_KEY = "degrande-bullet-threading-toolbar";
const TOOLBAR_TOGGLE_ID = "degrande-bullet-threading-toolbar-toggle";
const PAGEBAR_ROOT_ID = "degrande-bullet-threading-pagebar";
const MAIN_CONTENT_CONTAINER_ID = "main-content-container";
const OVERLAY_ROOT_ID = "degrande-bullet-threading-overlay";
const OVERLAY_ANCHOR_CLASS = "dgbt-overlay-anchor";
const SETTINGS_PREVIEW_STAGE_ID = "degrande-bullet-threading-settings-preview";
const STYLE_RESOURCE = "custom.css";
const PAGEBAR_REGISTRY_KEY = "__degrandeBulletThreadingRegisteredPagebars";
const TOOLBAR_REGISTRY_KEY = "__degrandeBulletThreadingRegisteredToolbars";
const COMMAND_REGISTRY_KEY = "__degrandeBulletThreadingRegisteredCommands";
const THREADING_STATE_CLASS = "dgbt-threading-enabled";
const THREADING_STYLE_KEY = "degrande-bullet-threading-runtime";
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

const MOTION_CHOICES = [
  "Still",
  "Gentle",
  "Expressive",
];

const THREAD_WIDTH_CHOICES = [
  "1px",
  "2px",
  "3px",
];

const SURFACE_CHOICES = [
  "Glass",
  "Solid",
];

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
    key: "threadWidth",
    type: "enum",
    title: "Thread width",
    description: "Width of the bullet threading path.",
    default: "2px",
    enumChoices: THREAD_WIDTH_CHOICES,
    enumPicker: "radio",
  },
  {
    key: "motionLevel",
    type: "enum",
    title: "Motion level",
    description: "How lively the threading preview should feel while we build it out.",
    default: "Expressive",
    enumChoices: MOTION_CHOICES,
    enumPicker: "select",
  },
  {
    key: "surfaceStyle",
    type: "enum",
    title: "Surface style",
    description: "Choose the shell treatment for the preview chrome.",
    default: "Glass",
    enumChoices: SURFACE_CHOICES,
    enumPicker: "select",
  },
];

const state = {
  enabled: true,
  accentColor: "#1f7ae0",
  threadWidth: "2px",
  motionLevel: "Expressive",
  surfaceStyle: "Glass",
  renderTimer: null,
  isDbGraph: false,
  overlayAnchor: null,
  overlayRoot: null,
  overlaySvg: null,
  overlayGlowPath: null,
  overlayCorePath: null,
  overlayDots: null,
  hostObserver: null,
  panelMounted: false,
  panelPreviewRaf: null,
  lastRuntimeStyleText: "",
  lastEnabledClassState: null,
};

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
  state.threadWidth = THREAD_WIDTH_CHOICES.includes(settings?.threadWidth) ? settings.threadWidth : "2px";
  state.motionLevel = MOTION_CHOICES.includes(settings?.motionLevel) ? settings.motionLevel : "Expressive";
  state.surfaceStyle = SURFACE_CHOICES.includes(settings?.surfaceStyle) ? settings.surfaceStyle : "Glass";
}

function getMotionTiming() {
  if (state.motionLevel === "Still") {
    return "0ms";
  }

  if (state.motionLevel === "Gentle") {
    return "1200ms";
  }

  return "700ms";
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
    <section id="${PAGEBAR_ROOT_ID}" class="dgbt-pagebar" data-motion="expressive" data-surface="glass">
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
            <span class="dgbt-chip dgbt-chip-muted" data-role="motion-text">Expressive motion</span>
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
  state.accentColor = normalized;
  persistPluginSetting({ accentColor: normalized });
  queueRender();
}

function setThreadWidth(nextValue) {
  const normalized = THREAD_WIDTH_CHOICES.includes(nextValue) ? nextValue : "2px";
  state.threadWidth = normalized;
  persistPluginSetting({ threadWidth: normalized });
  queueRender();
}

function setMotionLevel(nextValue) {
  const normalized = MOTION_CHOICES.includes(nextValue) ? nextValue : "Expressive";
  state.motionLevel = normalized;
  persistPluginSetting({ motionLevel: normalized });
  queueRender();
}

function setSurfaceStyle(nextValue) {
  const normalized = SURFACE_CHOICES.includes(nextValue) ? nextValue : "Glass";
  state.surfaceStyle = normalized;
  persistPluginSetting({ surfaceStyle: normalized });
  queueRender();
}

function getSettingsPreviewPathData() {
  const stage = document.getElementById(SETTINGS_PREVIEW_STAGE_ID);

  if (!stage) {
    return { pathData: "", points: [] };
  }

  const stageRect = stage.getBoundingClientRect();
  const points = Array.from(stage.querySelectorAll("[data-preview-path-point]"))
    .map((pointElement) => {
      const rect = pointElement.getBoundingClientRect();
      return {
        x: rect.left - stageRect.left + (rect.width / 2),
        y: rect.top - stageRect.top + (rect.height / 2),
      };
    });

  return {
    pathData: buildSvgPath(points),
    points,
  };
}

function renderSettingsPreview() {
  const stage = document.getElementById(SETTINGS_PREVIEW_STAGE_ID);

  if (!stage) {
    return;
  }

  stage.style.setProperty("--dgbt-accent", state.accentColor);
  stage.style.setProperty("--dgbt-thread-width", state.threadWidth);
  stage.style.setProperty("--dgbt-thread-motion-duration", getMotionTiming());
  stage.dataset.motion = state.motionLevel.toLowerCase();
  stage.dataset.surface = state.surfaceStyle.toLowerCase();
  stage.classList.toggle("is-paused", !state.enabled);

  const { pathData, points } = getSettingsPreviewPathData();
  const svg = stage.querySelector("[data-role='settings-preview-svg']");
  const glowPath = stage.querySelector("[data-role='settings-preview-path-glow']");
  const corePath = stage.querySelector("[data-role='settings-preview-path-core']");
  const dots = stage.querySelector("[data-role='settings-preview-dots']");

  if (!svg || !glowPath || !corePath || !dots) {
    return;
  }

  svg.setAttribute("viewBox", `0 0 ${Math.max(stage.clientWidth, 1)} ${Math.max(stage.clientHeight, 1)}`);
  glowPath.setAttribute("d", pathData);
  corePath.setAttribute("d", pathData);
  dots.innerHTML = points.map((point, index) => `
    <circle
      class="dgbt-settings-preview-dot${index === points.length - 1 ? " is-active" : ""}"
      cx="${point.x}"
      cy="${point.y}"
      r="${index === points.length - 1 ? 6 : 5}"
    ></circle>
  `).join("");
}

function queueSettingsPreviewRender() {
  if (state.panelPreviewRaf) {
    cancelAnimationFrame(state.panelPreviewRaf);
  }

  state.panelPreviewRaf = requestAnimationFrame(() => {
    state.panelPreviewRaf = null;
    renderSettingsPreview();
  });
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
            <p class="dgbt-panel-subtitle">Tune the active-path threading with a live three-level preview on the left and the controls on the right. Changes apply directly to the graph as you adjust them.</p>
          </div>
          <div class="dgbt-panel-header-actions">
            <button class="dgbt-panel-button dgbt-panel-button-secondary" type="button" data-action="close-panel">Close</button>
          </div>
        </header>
        <div class="dgbt-panel-main">
          <section class="dgbt-panel-preview-column">
            <article class="dgbt-panel-card dgbt-panel-card-hero">
              <div class="dgbt-panel-card-head">
                <div>
                  <p class="dgbt-panel-card-eyebrow">Live Preview</p>
                  <h2>Three levels with one active route</h2>
                </div>
                <div class="dgbt-panel-card-status" data-role="panel-status-text">Threading active</div>
              </div>
              <div class="dgbt-settings-preview-stage" id="${SETTINGS_PREVIEW_STAGE_ID}">
                <svg class="dgbt-settings-preview-svg" data-role="settings-preview-svg" aria-hidden="true" focusable="false">
                  <path class="dgbt-settings-preview-path dgbt-settings-preview-path-glow" data-role="settings-preview-path-glow"></path>
                  <path class="dgbt-settings-preview-path dgbt-settings-preview-path-core" data-role="settings-preview-path-core"></path>
                  <g data-role="settings-preview-dots"></g>
                </svg>
                <div class="dgbt-settings-preview-node dgbt-settings-preview-node-root is-active">
                  <span class="dgbt-settings-preview-bullet" data-preview-path-point></span>
                  <div class="dgbt-settings-preview-card">
                    <div class="dgbt-settings-preview-label">Level 1</div>
                    <strong>QMS - Afdeling Q</strong>
                    <div class="dgbt-settings-preview-tags"><span>#QMS</span><span>#Work</span></div>
                  </div>
                </div>
                <div class="dgbt-settings-preview-node dgbt-settings-preview-node-branch is-active">
                  <span class="dgbt-settings-preview-bullet" data-preview-path-point></span>
                  <div class="dgbt-settings-preview-card">
                    <div class="dgbt-settings-preview-label">Level 2</div>
                    <strong>Authentication</strong>
                    <p>Shared branch node on the active route.</p>
                  </div>
                </div>
                <div class="dgbt-settings-preview-node dgbt-settings-preview-node-leaf is-active">
                  <span class="dgbt-settings-preview-bullet" data-preview-path-point></span>
                  <div class="dgbt-settings-preview-card">
                    <div class="dgbt-settings-preview-label">Level 3</div>
                    <strong>Login / log ud</strong>
                    <p>The currently selected node anchors the highlighted path.</p>
                  </div>
                </div>
                <div class="dgbt-settings-preview-node dgbt-settings-preview-node-sibling">
                  <span class="dgbt-settings-preview-bullet"></span>
                  <div class="dgbt-settings-preview-card is-muted">
                    <div class="dgbt-settings-preview-label">Sibling</div>
                    <strong>Authorization</strong>
                    <p>Muted until this branch becomes active.</p>
                  </div>
                </div>
              </div>
              <div class="dgbt-panel-preview-meta">
                <span class="dgbt-panel-pill" data-role="panel-motion-pill">Expressive motion</span>
                <span class="dgbt-panel-pill dgbt-panel-pill-muted" data-role="panel-width-pill">2px thread width</span>
                <span class="dgbt-panel-pill dgbt-panel-pill-muted" data-role="panel-surface-pill">Glass surface</span>
              </div>
            </article>
          </section>
          <aside class="dgbt-panel-controls-column">
            <article class="dgbt-panel-card">
              <div class="dgbt-panel-card-head">
                <div>
                  <p class="dgbt-panel-card-eyebrow">Behavior</p>
                  <h2>Threading controls</h2>
                </div>
              </div>
              <label class="dgbt-switch-row">
                <div>
                  <strong>Enable active-path threading</strong>
                  <p>Turns the active route overlay on or off.</p>
                </div>
                <input type="checkbox" data-setting="threadingEnabled">
              </label>
              <section class="dgbt-control-group">
                <div class="dgbt-control-head">
                  <strong>Accent color</strong>
                  <span data-role="panel-accent-label">#1f7ae0</span>
                </div>
                <div class="dgbt-color-row">
                  <input class="dgbt-color-input" type="color" data-setting="accentColor">
                  <input class="dgbt-text-input" type="text" inputmode="text" data-setting="accentHex" placeholder="#1f7ae0">
                </div>
              </section>
              <section class="dgbt-control-group">
                <div class="dgbt-control-head">
                  <strong>Thread width</strong>
                </div>
                <div class="dgbt-choice-grid dgbt-choice-grid-compact">
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
                <div class="dgbt-choice-grid">
                  ${MOTION_CHOICES.map((choice) => `
                    <button class="dgbt-choice-button" type="button" data-action="set-motion" data-value="${choice}">${choice}</button>
                  `).join("")}
                </div>
              </section>
              <section class="dgbt-control-group">
                <div class="dgbt-control-head">
                  <strong>Preview surface</strong>
                </div>
                <div class="dgbt-choice-grid">
                  ${SURFACE_CHOICES.map((choice) => `
                    <button class="dgbt-choice-button" type="button" data-action="set-surface" data-value="${choice}">${choice}</button>
                  `).join("")}
                </div>
              </section>
            </article>
            <article class="dgbt-panel-card dgbt-panel-card-note">
              <div class="dgbt-panel-card-head">
                <div>
                  <p class="dgbt-panel-card-eyebrow">Direction</p>
                  <h2>What this page controls</h2>
                </div>
              </div>
              <ul class="dgbt-note-list">
                <li>The overlay follows the selected node and its ancestors only.</li>
                <li>The preview reflects the same stroke width, accent, and motion settings used in the graph.</li>
                <li>Plugin settings still persist the values, but this is now the main editing surface.</li>
              </ul>
            </article>
          </aside>
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
    accentInput.value = state.accentColor;
  }

  if (accentHexInput && accentHexInput !== document.activeElement) {
    accentHexInput.value = state.accentColor;
  }

  document.querySelectorAll("[data-setting='threadWidth']").forEach((input) => {
    input.checked = input.value === state.threadWidth;
  });

  document.querySelectorAll("[data-action='set-motion']").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === state.motionLevel);
  });

  document.querySelectorAll("[data-action='set-surface']").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === state.surfaceStyle);
  });

  const statusText = document.querySelector("[data-role='panel-status-text']");
  const motionPill = document.querySelector("[data-role='panel-motion-pill']");
  const widthPill = document.querySelector("[data-role='panel-width-pill']");
  const surfacePill = document.querySelector("[data-role='panel-surface-pill']");
  const accentLabel = document.querySelector("[data-role='panel-accent-label']");

  if (statusText) {
    statusText.textContent = state.enabled ? "Threading active" : "Threading paused";
  }

  if (motionPill) {
    motionPill.textContent = `${state.motionLevel} motion`;
  }

  if (widthPill) {
    widthPill.textContent = `${state.threadWidth} thread width`;
  }

  if (surfacePill) {
    surfacePill.textContent = `${state.surfaceStyle} surface`;
  }

  if (accentLabel) {
    accentLabel.textContent = state.accentColor;
  }

  queueSettingsPreviewRender();
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

    if (action === "set-surface") {
      setSurfaceStyle(actionTarget.dataset.value);
      syncPanelState();
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
  queueSettingsPreviewRender();
}

function closeThreadingSettings() {
  logseq.setMainUIInlineStyle({});
  logseq.hideMainUI({ restoreEditingCursor: true });
}

function syncThreadingHostState() {
  const hostDocument = getHostDocument();
  const runtimeStyle = `
    :root {
      --dgbt-thread-width: ${state.threadWidth};
      --dgbt-thread-accent: ${state.accentColor};
      --dgbt-thread-guideline-color: color-mix(in srgb, ${state.accentColor} 20%, var(--ls-guideline-color, rgba(148, 163, 184, 0.48)));
      --dgbt-thread-soft-color: color-mix(in srgb, ${state.accentColor} 38%, transparent);
      --dgbt-thread-active-color: color-mix(in srgb, ${state.accentColor} 86%, white 14%);
      --dgbt-thread-bullet-color: color-mix(in srgb, ${state.accentColor} 62%, var(--ls-block-bullet-color, rgba(148, 163, 184, 0.84)));
      --dgbt-thread-motion-duration: ${getMotionTiming()};
    }
  `;

  if (runtimeStyle !== state.lastRuntimeStyleText) {
    logseq.provideStyle({
      key: THREADING_STYLE_KEY,
      style: runtimeStyle,
    });
    state.lastRuntimeStyleText = runtimeStyle;
  }

  if (state.lastEnabledClassState !== state.enabled) {
    hostDocument.documentElement?.classList.toggle(THREADING_STATE_CLASS, state.enabled);
    hostDocument.body?.classList.toggle(THREADING_STATE_CLASS, state.enabled);
    state.lastEnabledClassState = state.enabled;
  }
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
        <path class="dgbt-overlay-path dgbt-overlay-path-glow"></path>
        <path class="dgbt-overlay-path dgbt-overlay-path-core"></path>
        <g class="dgbt-overlay-dots"></g>
      </svg>
    `;
    anchor.appendChild(overlayRoot);
  } else if (overlayRoot.parentElement !== anchor) {
    anchor.appendChild(overlayRoot);
  }

  state.overlayRoot = overlayRoot;
  state.overlaySvg = overlayRoot.querySelector(".dgbt-overlay-svg");
  state.overlayGlowPath = overlayRoot.querySelector(".dgbt-overlay-path-glow");
  state.overlayCorePath = overlayRoot.querySelector(".dgbt-overlay-path-core");
  state.overlayDots = overlayRoot.querySelector(".dgbt-overlay-dots");
  return overlayRoot;
}

function clearOverlayPath() {
  if (!state.overlayRoot) {
    return;
  }

  state.overlayRoot.classList.add("is-hidden");
  state.overlayGlowPath?.setAttribute("d", "");
  state.overlayCorePath?.setAttribute("d", "");

  if (state.overlayDots) {
    state.overlayDots.innerHTML = "";
  }
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

  if (!bulletElement || !anchor) {
    return null;
  }

  const rect = bulletElement.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  return {
    x: rect.left - anchorRect.left + anchor.scrollLeft + (rect.width / 2),
    y: rect.top - anchorRect.top + anchor.scrollTop + (rect.height / 2),
  };
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
    const previous = points[index - 1];
    const current = points[index];
    const deltaX = current.x - previous.x;
    const deltaY = current.y - previous.y;
    const cornerRadius = Math.max(0, Math.min(12, Math.abs(deltaX), Math.abs(deltaY) / 2));

    if (cornerRadius === 0) {
      pathData += ` L ${current.x} ${current.y}`;
      continue;
    }

    const verticalTarget = current.y - cornerRadius;
    const cornerEndX = previous.x + (deltaX >= 0 ? cornerRadius : -cornerRadius);

    pathData += ` L ${previous.x} ${verticalTarget}`;
    pathData += ` Q ${previous.x} ${current.y} ${cornerEndX} ${current.y}`;
    pathData += ` L ${current.x} ${current.y}`;
  }

  return pathData;
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

  const points = getBlockPathChain(activeBlock)
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
  const width = Math.max(state.overlayAnchor?.scrollWidth || state.overlayAnchor?.clientWidth || 1, 1);
  const height = Math.max(state.overlayAnchor?.scrollHeight || state.overlayAnchor?.clientHeight || 1, 1);

  if (state.overlayRoot) {
    state.overlayRoot.style.width = `${width}px`;
    state.overlayRoot.style.height = `${height}px`;
  }

  state.overlaySvg?.setAttribute("viewBox", `0 0 ${width} ${height}`);
  state.overlayGlowPath?.setAttribute("d", pathData);
  state.overlayCorePath?.setAttribute("d", pathData);

  if (state.overlayDots) {
    state.overlayDots.innerHTML = points
      .map((point, index) => {
        const radius = index === points.length - 1 ? 5.5 : 4.5;
        return `<circle class="dgbt-overlay-dot${index === points.length - 1 ? " is-active" : ""}" cx="${point.x}" cy="${point.y}" r="${radius}"></circle>`;
      })
      .join("");
  }
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

        if (state.overlayRoot && targetNode && typeof targetNode.nodeType === "number" && state.overlayRoot.contains(targetNode)) {
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
  hostWindow.addEventListener("resize", queueRender);
}

function updatePagebarUi() {
  const root = getHostDocument().getElementById(PAGEBAR_ROOT_ID);

  if (!root) {
    return;
  }

  root.style.setProperty("--dgbt-accent", state.accentColor);
  root.dataset.motion = state.motionLevel.toLowerCase();
  root.dataset.surface = state.surfaceStyle.toLowerCase();
  root.classList.toggle("is-paused", !state.enabled);

  const status = root.querySelector('[data-role="status-text"]');
  const motion = root.querySelector('[data-role="motion-text"]');

  if (status) {
    status.textContent = state.enabled ? "Threading active" : "Threading paused";
  }

  if (motion) {
    motion.textContent = `${state.motionLevel} motion · ${state.threadWidth} · ${state.surfaceStyle}`;
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
    logseq.App.onRouteChanged(() => {
      queueRender();
    });
  }

  if (typeof logseq.App.onThemeModeChanged === "function") {
    logseq.App.onThemeModeChanged(() => {
      queueRender();
    });
  }
}

async function main() {
  console.info(`[Degrande Bullet Threading] Starting v${PLUGIN_VERSION}`);

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
})();