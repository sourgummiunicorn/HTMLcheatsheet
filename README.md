# HTML Field Guide

A dependency-free, interactive HTML cheat sheet for beginner coders in Programming with AI. The design follows the supplied Interface Playground style: cobalt, lavender surfaces, editorial typography, and four hands-on learning labs.

## Files

- `dist/index.html`: semantic page, lab controls, and challenge editor
- `dist/style.css`: responsive layout, design tokens, and accessible focus styles
- `dist/script.js`: 29 tag reference entries, syntax highlighting, search/filter, copy controls, dialogs, and isolated demos
- `dist/profile.svg`: local starter-profile illustration
- `dist/favicon.svg`: browser icon

## Preview

Run `python3 -m http.server 4173 --directory dist` from this folder, then open http://localhost:4173. No installation or build step is required.

The form is a local demonstration and does not transmit or store data. The profile editor uses a sandboxed iframe; scripts do not run in its preview. Example media filenames must be replaced with real files. Copying a profile starter to another folder also requires copying `profile.svg` or replacing the image source.

## Verified

JavaScript syntax; browser rendering; tag search and empty results; modal open/Escape; clipboard copy; text and list demos; local form submission; challenge rendering; mobile horizontal overflow. No external runtime dependencies.
