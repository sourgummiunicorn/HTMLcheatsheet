# HTML Field Guide

A dependency-free HTML reference and introduction activity for Programming with AI students. The design uses three blues sampled from the supplied reference (`#0A038E`, `#2C64E8`, `#27B5F5`) and a lightened sky blue (`#BDEBFF`), an Orbitron hero headline with Futura fallback, Georgia section headings, and Avenir Next / Segoe UI body text. Generated page previews keep black text for readability.

## Run locally

Run `python3 -m http.server 4173 --directory dist`, then open http://localhost:4173. No installation or build step is required.

## Introduction and computational thinking

The five missions ask students to introduce themselves, define a focus, make a heading and unordered list of things they enjoy, emphasize text with `em`, and link a relevant resource.

Each guided mission opens a blank HTML editor. Students type the opening and closing tags themselves; the mission prompts and hints describe the needed structure without prefilled markup. The live preview renders their code, and the complete source appears after all five missions, ready to copy into VS Code. The rest of the field guide offers HTML examples for reference.

- The third mission requires an `h2`, a `ul`, and at least three filled `li` elements.
- The fourth mission requires a paragraph containing meaningful text wrapped in an `em` element. `em` usually appears in italics; `strong` is the element for strong importance.
- Mission 5 accepts `https://example.com`, `http://example.com`, and beginner-entered `www.example.com` links. `www.` links become HTTPS in the preview and export.
- Completion checks confirm the requested HTML structure, content, and closing tags.
- Completing all five missions reveals a clean `index.html` below the activity, with copy and select-all controls for pasting into VS Code. It includes only the doctype, English language declaration, UTF-8, title, and body—no CSS or JavaScript.

The avatar picker and its assets were removed from the activity. The HTML reference still teaches images and alt text.

## Source

- `dist/index.html` and `dist/style.css`: semantic interface and responsive styling.
- `dist/script.js`: searchable tag reference, syntax highlighting, dialogs, clipboard, and original small demos.
- `dist/missions.js`: mission content, validation, draft state, isolated preview, and complete-page export.

Drafts stay in memory and reset on reload. The experiment editor preserves a separate draft. Copy creates a clean HTML document. Scripts, event handlers, and active embedded documents are removed from preview/export; a sandbox and restrictive content policy isolate the preview. HTTP(S) links work in both copied pages and the preview, opening in a separate tab with noopener/noreferrer. The iframe allows popups without granting scripts or same-origin access to learner content. No student data is submitted or persisted.

## Verification

Browser checks cover:

- Each mission editor starts empty and remains empty after reset; an unclosed heading does not pass the first check.
- The third mission rejects missing headings, unclosed list markup, and lists with fewer than three items.
- The emphasis mission rejects paragraphs without a completed `em` element.
- `www.` links pass the fifth-mission check and become HTTPS links in the preview and export.
- Five-step completion and clean exported document contents.
- Inline full-code reveal after completion, exact clipboard copying, select-all, live refresh after a valid edit, and hiding the panel when a completed answer becomes invalid.
- No trace controls appear in the list mission.
- Responsive layout.

Exported markup was inspected to confirm it has no embedded styles or scripts. JavaScript syntax and Git whitespace checks pass.

## Copy and link regression checks

- Copy now invokes the Clipboard API in the original click gesture. The misleading legacy execCommand success path was removed.
- Finished-page copying opens a visible, selected HTML export with retry, select-all, and download controls. Missing or rejected clipboard access preserves the code and explains keyboard copying.
- `node --test tests/copy.test.cjs` verifies exact writes, rejected promises, unavailable APIs, and synchronous clipboard exceptions.
- Browser checks confirmed exact clipboard equality, a downloaded `index.html` containing the test profile, and a final-step preview link opening its actual destination in a separate tab.
