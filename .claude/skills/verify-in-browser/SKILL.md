---
name: verify-in-browser
description: Use when verifying a UI change actually renders/behaves correctly in the running app (not just unit tests). Covers this project's dev-server port quirk and the reliable way to read the live page.
---

# Verify in the browser

For anything visible in the app, confirm it in a real browser after unit tests pass. Use the `preview_*` tools (not Bash) to run the dev server.

## Start the server

`preview_start` with name `dev` (defined in `.claude/launch.json`). Note the quirk below.

## The port quirk (important)

The `npm run dev` command runs bare `vite`, which **picks its own port** — if 5173 is busy it uses **5174**, ignoring the port the preview harness assigns. So:

- The harness may report a port (e.g. 62866) that is **not** where the app is served. Check the actual port with `preview_logs` (search `Local`) — it's usually `http://localhost:5174/`.
- The preview tab tends to **revert to the harness's tracked (dead) port between eval calls**, and `preview_screenshot` grabs that dead tab — so screenshots often come back blank.

## Reliable pattern: single-eval DOM reads

Because the tab reverts between calls, do **navigate + interact + assert in ONE `preview_eval`** so it all runs on the same live page:

```js
(async () => {
  if (!location.href.includes('5174')) { location.href = 'http://localhost:5174/some-route'; return 'navigating'; }
  await new Promise(r => setTimeout(r, 300));
  const btn = [...document.querySelectorAll('button')].find(b => /Label/i.test(b.textContent));
  btn?.click();
  await new Promise(r => setTimeout(r, 300));
  return JSON.stringify({ dialog: document.querySelectorAll('[role="dialog"]').length });
})()
```

If the first call returns `'navigating'`, call the same eval again — the page is now live. DOM reads (roles, text, computed styles via `getComputedStyle`) are the source of truth here, not screenshots.

## Responsive checks

`preview_resize` with `preset: 'mobile'` (375px) or an explicit `width` (the app's breakpoint is `max-width: 768px`; the "desktop" preset may reset to a narrow native window, so pass `width: 1280` explicitly to test the desktop state).

## Build-level verification

For prerendered output (e.g. JSON-LD, meta tags), run the real build and grep `dist/`. Full `npm run build` needs Chromium — run `npm run test:e2e:install` once, then `npm run build`, then inspect `dist/**/index.html`.
