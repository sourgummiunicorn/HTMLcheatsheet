# HTML Field Guide

A dependency-free HTML reference and introduction activity for Programming with AI students. The design uses three blues sampled from the supplied reference (`#0A038E`, `#2C64E8`, `#27B5F5`) and a lightened sky blue (`#BDEBFF`), an Orbitron hero headline with Futura fallback, Georgia section headings, and Avenir Next / Segoe UI body text. Generated page previews keep black text for readability.

## Run locally

Run `python3 -m http.server 4173 --directory dist`, then open http://localhost:4173. No installation or build step is required.

## Introduction and computational thinking

The five missions ask students to introduce themselves, define a research or coursework focus, model a procedure, design test cases, and link a relevant resource.

- The workflow uses an input description, at least three ordered actions, and an output description.
- The trace walks through the student's own text and highlights the corresponding step in the preview. It does not execute an algorithm, transform data, or infer an answer.
- Test cases include both a typical input and an edge-case input, each with an expected result.
- Reflection prompts ask students to identify dependencies, ambiguities, assumptions, and changes suggested by their tests.
- Completion checks validate HTML structure and populated fields, not the correctness or quality of reasoning. Peer review and manual tracing are part of the activity.

The avatar picker and its assets were removed from the activity. The HTML reference still teaches images and alt text.

## Source

- `dist/index.html` and `dist/style.css`: semantic interface and responsive styling.
- `dist/script.js`: searchable tag reference, syntax highlighting, dialogs, clipboard, and original small demos.
- `dist/missions.js`: mission content, validation, draft state, tracing, isolated preview, and complete-page export.

Drafts stay in memory and reset on reload. The experiment editor preserves a separate draft. Copy creates a complete HTML document with embedded CSS. Scripts, event handlers, and active embedded documents are removed from preview/export; a sandbox and restrictive content policy isolate the preview. HTTP(S) links work in both copied pages and the preview, opening in a separate tab with noopener/noreferrer. The iframe allows popups without granting scripts or same-origin access to learner content. No student data is submitted or persisted.

## Verification

Browser checks cover:

- Empty workflow rejection and disabled tracing until input, three steps, and output are present.
- Correct ordered trace progression, matching preview highlighting, output comparison, and restart.
- Missing test-case predictions rejected; populated typical and edge cases accepted.
- Editing a completed workflow to fewer than three steps clears completion and disables tracing.
- Five-step completion, self-contained exported document contents, and both workflow and test-case inclusion.
- Workflow controls hidden in the separate experiment editor.
- Contextual ordered-list help, keyboard opening, Escape dismissal, and responsive layout.

Exported markup and embedded styles were inspected. The browser downloaded the complete HTML file successfully; standalone rendering of that downloaded file was not separately checked. JavaScript syntax and Git whitespace checks pass.

## Copy and link regression checks

- Copy now invokes the Clipboard API in the original click gesture. The misleading legacy execCommand success path was removed.
- Finished-page copying opens a visible, selected HTML export with retry, select-all, and download controls. Missing or rejected clipboard access preserves the code and explains keyboard copying.
- `node --test tests/copy.test.cjs` verifies exact writes, rejected promises, unavailable APIs, and synchronous clipboard exceptions.
- Browser checks confirmed exact clipboard equality, a downloaded `index.html` containing the test profile, and a final-step preview link opening its actual destination in a separate tab.
