# The art of healing

A static Astro website for psychologist Polyxeni Petta, with approved Greek and English content on Home, Biography (`bio/`), Services (`services/`) and Contact (`contact/`). The private office is in Piraeus, serving Athens and Korinthos, with online sessions and Greek/English sessions available. All public wording and contact values are editable in dedicated JSON files under `src/content/`; see [the content editing guide](src/content/README.md). The site remains in demonstration publication mode pending launch review. Implementation is tracked in [Implement the bilingual static psychologist website](https://github.com/LaskasP/the-art-of-healing/issues/8).

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

The Playwright suite starts production preview servers on ports 4321–4326. Stop local development/preview servers using those ports first. Its normal builds live in `dist/root/` and `dist/repository/`. A separate Contact fixture build lives in `.test-build/contact/`, outside the publishable `dist/` directory. Publication fixtures in `.test-build/launch-root/`, `.test-build/launch-repository/` and `.test-build/demonstration-ready/` test approved-page behavior in both hosting configurations and confirm that demonstration mode excludes even ready pages. Fixture builders copy sources into an OS temporary directory, substitute settings only in that copy, build, and remove the copy. They never modify production sources. Tests verify that fixture contact values are absent from both normal demonstration builds. Never publish `.test-build/`.

First-paint regression checks also start development servers on ports 4331–4332 for both deployment bases. They delay scripts and compare the heading and header from the first visible frame through navigation, catching flashes of unstyled content and a briefly expanded mobile menu. Run these checks with `npx playwright test tests/navigation-paint.spec.ts`. Shared styles load through stylesheet links in the document head so they apply before first paint in development as well as production.

Run focused checks with `npx playwright test tests/contact.spec.ts` or `npx playwright test tests/contact-fixture.spec.ts --project contact-fixture`. For mobile menu checks, use `npx playwright test tests/home.spec.ts --project repository-base --grep "mobile menu"`. A failed test retains a trace in `test-results/`; layout tests also save desktop/mobile screenshots there for visual review.

Run `npx playwright test tests/seo.spec.ts` to check every available route's localized metadata, canonical URLs, indexing, equivalent-page links, loaded assets, crawlability and sitemap across demonstration and launch fixtures. The tests exercise generated artifacts and browser behavior, using explicitly isolated readiness settings; they do not change publication approval. Test servers explicitly set their publication mode, regardless of the calling shell's environment.

The tests use only the delivered website: direct language routes, navigation, switching, mobile keyboard/menu behavior, metadata, crawling, loaded assets, narrow-screen reflow, and navigation without JavaScript. Supplement automation with visual review of both languages, keyboard focus, contrast, and browser zoom. Automated checks do not establish WCAG conformance.

## Settings and deployment paths

`src/config/site.ts` centralizes the origin, deployment base and publication state, and exposes shared contact settings from `src/config/contact.ts`. Verified contact values are loaded from `src/content/contact-details.json`. Build-time environment variables override the deployment defaults:

| Setting | Default | Domain-root example |
| --- | --- | --- |
| `SITE_ORIGIN` | `https://laskasp.github.io` | Your eventual verified HTTPS origin |
| `SITE_BASE` | `/the-art-of-healing/` | `/` |
| `SITE_PUBLICATION` | `demonstration` | `demonstration` until public launch is approved |

For a local root-path build in PowerShell:

```powershell
$env:SITE_BASE = '/'
npm run build
npm run preview
# After stopping preview, restore the default for subsequent commands:
Remove-Item Env:SITE_BASE
```

Set `SITE_ORIGIN` to the real domain origin when it becomes available. It must have no path, credentials, query or fragment; `SITE_BASE` supplies the path. Reserved placeholder domains (including example.com, .example, .invalid and .test) and localhost/loopback origins are rejected so SEO artifacts cannot accidentally advertise those destinations. Local development and preview still work: the page is served locally while its canonical URL uses the configured public origin. Restart development or rebuild after changing settings. These variables come from the shell/CI environment, not a committed `.env` file. Asset imports use Astro's base-aware build output; ordinary page links use the configured base through the shared registry helper.

The result is HTML, CSS and a small navigation script, requiring no production application backend. The GitHub Pages workflow is `.github/workflows/pages.yml`; it validates before deploying successful `main` pushes. See the first-deployment instructions below. Preparing the workflow does not itself commit, push or publish changes.

### Publication and search artifacts

Two controls determine indexing together:

- `SITE_PUBLICATION` accepts only `demonstration` (the default) or `launch`. An unrecognized value fails the build. Publishing a demonstration never changes this setting automatically.
- `src/config/readiness.ts` lists page identities whose **Greek and English content are both final, verified and approved**. The copy is approved and integrated; the list remains empty until the separate launch review. A page omitted from the list stays `noindex` even in launch mode.

| Mode | Ready page | Unready page |
| --- | --- | --- |
| Demonstration | `noindex, follow` | `noindex, follow` |
| Launch | `index, follow` | `noindex, follow` |

All pages have a self-canonical URL derived from the configured origin/base and common route registry. Only indexable translated pairs receive reciprocal `el`/`en` hreflang links. `/sitemap.xml`, relative to `SITE_BASE`, contains only indexable canonical URLs; it has no URL entries in demonstration mode or when no pages are ready. For the default project path its location is `https://laskasp.github.io/the-art-of-healing/sitemap.xml`. `robots.txt` allows crawling in both modes so crawlers can read `noindex`; search exclusion is not access control.

When public launch is approved, review the integrated translations and visual presentation, and list only launch-ready page identities in `readyPages`. Content integration alone does not enable indexing. Set the actual public origin/base, explicitly set `SITE_PUBLICATION=launch` in the build environment, rebuild, and inspect the resulting metadata and sitemap before publication. A local policy check in PowerShell is:

```powershell
$env:SITE_PUBLICATION = 'launch'
npm run build
# With the current empty readiness list, every page still remains noindex.
Remove-Item Env:SITE_PUBLICATION
npm run build
```

Do not alter the real readiness list to test launch behavior: the browser suite supplies its own isolated readiness fixture. Adding a new registry page leaves it excluded from indexing until both controls permit it. The metadata tests check the actual content files; independent fact assertions must be updated deliberately if those facts change.

Custom-domain purchase/provisioning, DNS changes, final visual/launch approval and Search Console verification on the final domain remain later work. Domain configuration and Search Console verification do not themselves override `noindex`. No visitor analytics or unverified business/professional structured data is generated.

## Editing and extending

### Editing text and contact details

See [src/content/README.md](src/content/README.md) for the complete editing workflow, field reference and JSON example. Text changes require no edits to Astro components or TypeScript.

- `src/content/home.json`, `biography.json`, `services.json` and `contact.json` each hold both language versions of a page, including its search title and description.
- `src/content/contact-details.json` is the single source for phone, email, the Piraeus address/floor, opening hours and Maps URL. `src/config/contact.ts` loads these values for the Contact renderer.
- `src/content/interface.json` holds branding, navigation labels, language-switch names, accessibility wording and the footer.
- The root `/content/` reference folder is ignored; the website's `src/content/` files are version-controlled and sufficient for a clean build. The approved source CV is not required at build time.

Use paired `el` and `en` values for translated text. Keep actual contact values out of templates. Missing shared contact details may be set to `null`, which renders the localized fallback. Piraeus is the only private office; Athens and Korinthos are the service area.

The Contact acceptance fixture replaces only `src/content/contact-details.json` in an isolated temporary source tree, demonstrating that content-file changes reach the output without template changes. Its marked test data in `tests/fixtures/contact.json` must not be copied into real content. The publication fixtures intentionally leave Services out of their partial-readiness list to test per-page gating; this does not indicate missing Services copy.

### Page sources and templates

`src/config/pages.ts` holds stable page identities and routes and reads navigation labels from the interface content. The same registry drives static route generation and equivalent-page language links. Home, Biography and Services share `ContentPage.astro`; Contact has its own data-driven presentation. `ContentLinks.astro` resolves internal page references to localized, base-aware URLs and fails the build for an unknown page identity.

To add another normal content page:

1. Create a bilingual JSON file following `PageContent` in `src/content/page.ts`, with `title`, `description`, `heading`, `paragraphs` and `sections`. Add a small TypeScript import adapter like `biography.ts` to validate the shape.
2. Add localized navigation labels to `interface.json` and register the new page with `template: 'content'`, its unique identity and routes in `src/config/pages.ts`.
3. Reuse `ContentPage.astro` and `SiteLayout.astro`; no duplicate language templates are required.
4. Run `npm run validate` and `npm run build`, and review both languages at mobile/desktop sizes. New pages remain excluded from indexing until the launch controls permit them.

Colors and typography remain centrally editable at the top of `src/styles/main.css`; responsive overrides live in `src/styles/responsive.css`. The existing branding/header changes are preserved. No booking, enquiry form, embedded map or visitor analytics is included. Record future work on GitHub rather than in local issue files.

## Deployment and self-hosted fonts

See [the first-deployment guide](docs/deployment.md) for GitHub Pages setup, validation gates, artifact checks, repository variables and rollback. `npm run check:deployment` verifies a fresh `dist/` without publishing it.

Noto Sans body text and Noto Serif headings are served locally from checked-in WOFF2 files with Greek/English subsets. Font sources/checksums are in `src/assets/fonts/sources.json`; original licences in `public/font-licenses/` ship with the site. No build-time download or visitor request to a font provider is needed.
