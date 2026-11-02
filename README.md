# The art of healing

A static Astro demonstration for one psychologist, with Greek pages at the deployment root and English pages under `en/`. Home, Biography (`bio/`) and Services (`services/`) are available in both languages. Biography contains explicit placeholders; Services displays an under-construction graphic. Content and branding are provisional. The remaining slices are tracked under [implementation specification #8](https://github.com/LaskasP/the-art-of-healing/issues/8).

## Build and run locally

### First-time setup

Install Node.js 22.23.4 or newer (Node 24 LTS recommended); npm is included with Node.js. Open PowerShell in the project folder and install the locked dependencies:

```powershell
npm ci
```

Run `npm ci` again after pulling changes that update `package-lock.json`. Playwright's browser is only needed for tests, not for building or running the website.

### Run while developing

```powershell
npm run dev
```

Keep the terminal running and open either page:

- Greek: <http://localhost:4321/the-art-of-healing/>
- English: <http://localhost:4321/the-art-of-healing/en/>

Astro reloads the page when you edit source files. There is no browser-language redirection. Stop the server with **Ctrl+C**. If port 4321 is occupied, use the URL printed in the terminal or choose a port with `npm run dev -- --port 4325`. `npm run dev -- --host 127.0.0.1` limits development access to this machine.

### Build and preview the production website

Stop the development server first, then run:

```powershell
npm run check
npm run build
npm run preview
```

`check` validates Astro and TypeScript. `build` generates the static website in `dist/`. `preview` serves that generated website locally, using the same Greek and English URLs above by default. Open it through the preview server rather than double-clicking an HTML file. Stop preview with **Ctrl+C**.

Preview does not rebuild when you edit source files: stop it, run `npm run build` again, then restart `npm run preview`. Node.js is needed for development and building; the generated website needs only static hosting in production.

### Run validation and browser tests

Install the test browser once, then run validation:

```powershell
npx playwright install chromium
npm run validate
```

`validate` runs typechecking and the browser acceptance suite. The suite builds the website itself, so no server needs to be started manually.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Astro development server |
| `npm run check` | Astro and TypeScript validation |
| `npm run build` | Generate static files in `dist/` |
| `npm run preview` | Inspect the most recent production build locally |
| `npm test` | Build and run browser acceptance checks at both deployment bases |
| `npm run validate` | Typecheck, then run the acceptance suite |

The Playwright suite starts production preview servers on ports 4321 and 4322. Stop local development/preview servers using those ports first. Its separate builds live in `dist/root/` and `dist/repository/`. Run a focused check with `npx playwright test tests/home.spec.ts --project repository-base --grep "mobile menu"`. A failed test retains a trace in `test-results/`; layout tests also save desktop/mobile screenshots there for visual review.

The tests use only the delivered website: direct language routes, navigation, switching, mobile keyboard/menu behavior, metadata, crawling, loaded assets, narrow-screen reflow, and navigation without JavaScript. Supplement automation with visual review of both languages, keyboard focus, contrast, and browser zoom. Automated checks do not establish WCAG conformance.

## Settings and deployment paths

`src/config/site.ts` centralizes the origin, deployment base, publication state, and shared contact settings. Contact values remain `null` until verified data is supplied. Build-time environment variables override the deployment defaults:

| Setting | Default | Domain-root example |
| --- | --- | --- |
| `SITE_ORIGIN` | `https://laskasp.github.io` | Your eventual verified HTTPS origin |
| `SITE_BASE` | `/the-art-of-healing/` | `/` |

For a local root-path build in PowerShell:

```powershell
$env:SITE_BASE = '/'
npm run build
npm run preview
# After stopping preview, restore the default for subsequent commands:
Remove-Item Env:SITE_BASE
```

Set `SITE_ORIGIN` to the real domain origin when it becomes available. It must have no path, query or fragment; `SITE_BASE` supplies the path. Restart development or rebuild after changing settings. These variables come from the shell/CI environment, not a committed `.env` file. Asset imports use Astro's base-aware build output; ordinary page links use the configured base through the shared registry helper.

The result is HTML, CSS and a small navigation script, requiring no production application backend. GitHub Pages remains the intended host. Automated deployment, canonical/alternate metadata, sitemap generation and public-launch indexing controls belong to subsequent slices of #8. No deployment or public launch is performed by this slice. All demonstration pages currently emit `noindex, follow`; `robots.txt` permits crawling so that exclusion can be read. Keep this state until the later launch policy and approved content are ready. Do not enable indexing simply to publish a demonstration.

## Editing and extending

- `src/config/pages.ts` holds stable page identities, localized routes and navigation labels. Only implemented pages appear in navigation. The same registry drives route generation and equivalent-page language links.
- `src/content/home.ts`, `biography.ts` and `services.ts` each contain both languages of one page, including titles and descriptions. Keep page copy in its bilingual content module. `src/config/interface.ts` holds shared interface wording.
- `src/pages/[...path].astro` generates both localized static URLs; `src/layouts/SiteLayout.astro` and `src/components/` provide shared presentation.
- `src/styles/main.css` begins with editable theme colors and the system-font stack, followed by base/component rules. `src/styles/responsive.css` is loaded afterward for responsive overrides. The earth-tone palette and text-only provisional logo await visual approval; no final logo asset is claimed.

To add a normal content page:

1. Create `src/content/example.ts` exporting an object with `el` and `en` entries. Each entry follows `PageContent` from `src/content/page.ts`: localized `title`, `description`, `heading`, `introduction`, and `sections` (each with a `heading` and `text`). Use `satisfies Record<'el' | 'en', PageContent>` to check both translations. See Biography for an example.
2. Add an entry in `src/config/pages.ts` with a unique `id`, `template: 'content'`, `routes: { el: 'example', en: 'en/example' }`, localized `labels`, and the imported bilingual `content`. Routes omit leading/trailing slashes and the deployment base. The registry automatically adds both static URLs, navigation links, active-page state and equivalent-page language switching.
3. Reuse `ContentPage.astro` and `SiteLayout.astro`; no separate language templates or route files are needed. `illustrationAlt` optionally enables the existing under-construction graphic with a localized alternative (as used by Services). Introduce a new shared template only for a genuinely different structure, select it in the route renderer, and reuse it across languages. Home keeps its own presentation.
4. Run `npm run check` and extend the browser acceptance suite to open both new URLs, navigate and switch languages at both deployment bases. Run `npm test` and inspect mobile/desktop presentation before committing.

Continue using one source per translation pair, ordinary links, verified facts, and the same browser acceptance seam. Add future page slices through the GitHub tracker; do not maintain duplicate local issue files.

Home and Biography use text only. Services imports a small SVG construction graphic, with localized alternative text and reserved dimensions; Astro generates its base-aware asset URL. Future meaningful images also need suitable alternative text and reserved dimensions. No booking, enquiry form, embedded map or visitor analytics is included.
