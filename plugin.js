const STARTUP_ERROR_PREFIX = "[Degrande Bullet Threading] Failed to start";
const FALLBACK_PLUGIN_VERSION = "0.3.10";
const MAIN_SCRIPT_DATA_ATTRIBUTE = "data-degrande-bullet-threading-main";

let pluginStartupPromise = null;

function getPluginVersion() {
  return document
    .querySelector('meta[name="degrande-bullet-threading-version"]')
    ?.getAttribute("content")
    || FALLBACK_PLUGIN_VERSION;
}

function loadMainScript(moduleUrl, version) {
  const existingScript = document.querySelector(`script[${MAIN_SCRIPT_DATA_ATTRIBUTE}="${version}"]`);

  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = moduleUrl;
    script.async = true;
    script.setAttribute(MAIN_SCRIPT_DATA_ATTRIBUTE, version);
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error(`Unable to load ${moduleUrl}`)), { once: true });
    document.head.appendChild(script);
  });
}

function startDegrandeBulletThreading() {
  if (pluginStartupPromise) {
    return;
  }

  const version = getPluginVersion();
  const resourcePath = `plugin-main.js?v=${encodeURIComponent(version)}`;

  pluginStartupPromise = Promise.resolve()
    .then(async () => {
      const moduleUrl = typeof logseq.resolveResourceFullUrl === "function"
        ? logseq.resolveResourceFullUrl(resourcePath)
        : `./${resourcePath}`;
      await loadMainScript(moduleUrl, version);
      const pluginMain = window.__degrandeBulletThreadingMain;

      if (typeof pluginMain !== "function") {
        throw new Error("plugin-main.js did not register window.__degrandeBulletThreadingMain()");
      }

      await pluginMain();
    })
    .catch((error) => {
      pluginStartupPromise = null;
      console.error(STARTUP_ERROR_PREFIX, error);
    });
}

logseq.ready(() => {
  startDegrandeBulletThreading();
}).catch((error) => {
  console.error(STARTUP_ERROR_PREFIX, error);
});