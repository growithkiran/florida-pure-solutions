# Florida Pure Solutions

The complete approved Florida Pure Solutions website, connected to this existing GHL AI Studio repository.

## Develop and build

```sh
npm install
npm run dev
npm run build
```

The original website is retained in `website-source/`, including every page, stylesheet, script, local font, image and vendor asset. `WEBSITE-SOURCE-MANIFEST.json` records the copied source hashes. Native AI Studio build/runtime configuration is retained for compatibility.

`src/server.ts` serves the approved five HTML pages directly without an iframe or a React redesign. Browser assets are mirrored in `public/`. Website interactions and GSAP motion run unchanged. When updating a browser asset, update its source copy in `website-source/dist/` and matching `public/` file.

## Included

- Homepage and four service pages.
- Approved desktop/mobile hero artwork and loading preview.
- Scroll motion, product visuals and a water planner with downloadable PDF.
- Separate hero Voice AI and bottom-right text chat shown after the hero.
- Connected demo calendar and coverage-review form with native resizing and accessible tabs.

AI conversations, form persistence/routing and completed bookings still need operator tests. No test messages, submissions or appointments were created during this transfer. Demo noindex remains enabled.

This is a public repository. Private client intake, internal CRM setup records, credentials and temporary deployment archives are not included. Existing Git history is preserved; normal commits on main sync to the connected AI Studio project.
