# Degrande Bullet Threading

Degrande Bullet Threading is a Logseq DB-first bullet threading plugin focused on showing the active route from the root node to the selected block. It uses an SVG overlay for measured path drawing, includes a popup settings page with live preview, and is tuned for Logseq DB graphs rather than file-graph DOM assumptions.

## Current Setup

- Dedicated top-level plugin folder matching the Degrande plugin layout.
- Publish-ready `package.json`, `index.html`, `plugin.js`, and `plugin-main.js` structure.
- Shared `custom.css` loaded through the packaged-plugin style path.
- Popup settings UI with a two-column layout and live three-level preview.
- Active-path SVG threading overlay with controls for enable state, accent color, thread width, motion level, and preview surface.
- GitHub release workflow that packages the plugin into a zip asset on tag push.

## Direction

- Keep the overlay limited to the active branch so the route to the selected node is easy to read.
- Improve performance on large DB pages by minimizing DOM observation and redundant rerenders.
- Continue refining DB-aware exclusions such as properties and other non-content regions.

## Load Unpacked Plugin

1. Open Logseq Desktop.
2. Enable Developer mode.
3. Open the Plugins dashboard.
4. Choose `Load unpacked plugin`.
5. Select the `logseq-db-degrande-bullet-threading` folder.

## Notes

- This plugin currently targets Logseq DB graphs only.
- The current runtime uses an SVG overlay anchored to the scrolling content area.
- Property regions are excluded from threading so metadata rows do not become part of the active path.