# HTML Field Guide

A dependency-free HTML reference and introduction activity for Programming with AI students. The design uses three blues sampled from the supplied reference (`#0A038E`, `#2C64E8`, `#27B5F5`) and a lightened sky blue (`#BDEBFF`), an Orbitron hero headline with Futura fallback, Georgia section headings, and Avenir Next / Segoe UI body text. Generated page previews keep black text for readability.

## Run locally

Run `python3 -m http.server 4173 --directory dist`, then open http://localhost:4173. No installation or build step is required.

## Introduction missions

The five missions ask students to introduce themselves, define a focus, share things they enjoy, emphasize an important idea, and link a relevant resource.

Each guided mission opens a blank HTML editor. Students type the opening and closing tags themselves; the mission prompts and hints describe the needed structure without prefilled markup. The live preview renders their code, and the complete source appears after all five missions, ready to copy into VS Code. The rest of the field guide offers HTML examples for reference.

- The third mission uses an `h2` heading followed by an unordered list with at least three interests.
- The fourth mission introduces `em` by asking students to emphasize meaningful words inside a paragraph.
- Completion checks confirm the requested HTML structure, content, and closing tags, not the quality of the student's ideas.
- Completing all five missions reveals the full, self-contained `index.html` below the activity, with copy and select-all controls for pasting into VS Code. The code updates if a completed answer is edited and disappears if a required answer becomes invalid.

The avatar picker and its assets were removed from the activity. The HTML reference still teaches images and alt text.

## Source

- `dist/index.html` and `dist/style.css`: semantic interface and responsive styling.
- `dist/script.js`: searchable tag reference, syntax highlighting, dialogs, clipboard, and original small demos.
- `dist/missions.js`: mission content, validation, draft state, isolated preview, and complete-page export.

Drafts stay in memory and reset on reload. The experiment editor preserves a separate draft. Copy creates a clean HTML document with only the basic document structure; the preview alone adds isolated styling. Scripts, event handlers, and active embedded documents are removed from preview/export; a sandbox and restrictive content policy isolate the preview. HTTP(S) links work in both copied pages and the preview, opening in a separate tab with noopener/noreferrer. Addresses beginning with `www.` are normalized to HTTPS for beginners. The iframe allows popups without granting scripts or same-origin access to learner content. No student data is submitted or persisted.

## Verification

Browser checks cover:

- Each mission editor starts empty and remains empty after reset; an unclosed heading does not pass the first check.
- Mission 3 rejects a missing heading, an ordered list, fewer than three interests, or unclosed tags.
- Mission 4 rejects a missing, empty, unclosed, or unnested `em` element; a complete emphasized phrase inside a paragraph is accepted.
- Editing a completed interests list to fewer than three items clears completion.
- Five-step completion, self-contained exported document contents, and inclusion of both the interests list and emphasized learning idea.
- Inline full-code reveal after completion, exact clipboard copying, select-all, live refresh after a valid edit, and hiding the panel when a completed answer becomes invalid.
- Mission 5 accepts both complete HTTP(S) addresses and beginner-entered `www.` addresses, removes the active-step highlight after completion, and enables the finished-page control.
- Responsive layout.

Exported markup and embedded styles were inspected. The browser downloaded the complete HTML file successfully; standalone rendering of that downloaded file was not separately checked. JavaScript syntax and Git whitespace checks pass.

## Copy and link regression checks

- Copy now invokes the Clipboard API in the original click gesture. The misleading legacy execCommand success path was removed.
- Finished-page copying opens a visible, selected HTML export with retry, select-all, and download controls. Missing or rejected clipboard access preserves the code and explains keyboard copying.
- `node --test tests/copy.test.cjs` verifies exact writes, rejected promises, unavailable APIs, and synchronous clipboard exceptions.
- Browser checks confirmed exact clipboard equality, a downloaded `index.html` containing the test profile, and a final-step preview link opening its actual destination in a separate tab.
