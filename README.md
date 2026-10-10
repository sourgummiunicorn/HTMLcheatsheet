# HTML Field Guide

A dependency-free, interactive HTML cheat sheet for beginner coders in Programming with AI. The design follows the supplied Interface Playground style: forest green, soft sage and warm cream surfaces, Georgia headings with Avenir Next / Segoe UI body type, and four hands-on learning labs.

## Files

- `dist/index.html`: semantic page, lab controls, and challenge editor
- `dist/style.css`: responsive layout, design tokens, and accessible focus styles
- `dist/script.js`: 29 tag reference entries, syntax highlighting, search/filter, copy controls, dialogs, and isolated demos
- `dist/missions.js`: five guided introduction missions, validation, session drafts, sandbox preview, and self-contained export
- `dist/avatars.js` and `dist/avatars/*.svg`: three bundled avatar illustrations
- `dist/profile.svg`: original reference illustration
- `dist/favicon.svg`: browser icon

## Preview

Run `python3 -m http.server 4173 --directory dist` from this folder, then open http://localhost:4173. No installation or build step is required.

The form is a local demonstration and does not transmit or store data. The introduction activity uses a sandboxed iframe with a restrictive content policy. Scripts, event handlers, and embedded active documents are removed from preview/export. Guided steps and the free-editing draft are kept separately in memory and reset on reload. Supplied avatars are embedded as SVG data URLs when copying a complete page, so no external image files are needed. The preview disables links; copied HTTP(S) links work. Other reference examples with media filenames require real files.

## Verified

JavaScript syntax; browser rendering; tag search and empty results; modal open/Escape; clipboard copy; text and list demos; local form submission; challenge rendering; mobile horizontal overflow. No external runtime dependencies.

## Introduction mission checks

Validated in the in-app browser:

- Empty heading, missing avatar description, one-item list, and non-HTTP link fail with actionable feedback.
- Completing all five missions reveals the finished-page controls.
- Editing a completed heading back to empty removes its completion check.
- Resetting the interests mission preserves the story and other completed steps.
- Switching avatars clears the old description and requires a fresh check.
- Guided and experimental drafts remain independent; returning to experimentation preserves its edits.
- Copy produces a complete document with CSS, an embedded SVG avatar, and an HTTP(S) link.
- The embedded SVG loads in the sandbox preview. Scripts and event handlers are removed; the host page remains unchanged.
- Tag help supports keyboard activation, Escape dismissal, and focus return.
- The page fits 390px and 1280px viewports without page-level horizontal overflow.

Independent viewing of the copied document was not completed: the test browser blocks data-URL navigation. Export structure and embedded-image rendering were verified separately. Student drafts are never persisted or transmitted.
