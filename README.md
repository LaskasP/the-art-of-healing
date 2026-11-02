# The art of healing

A static Astro demonstration for one psychologist, with Greek pages at the deployment root and English pages under `en/`. Home, Biography (`bio/`), Services (`services/`) and Contact (`contact/`) are available in both languages. Biography contains explicit placeholders; Services displays an under-construction graphic; Contact identifies details that have not yet been supplied. Content and branding are provisional. The remaining slices are tracked under [implementation specification #8](https://github.com/LaskasP/the-art-of-healing/issues/8).

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

Run focused checks with `npx playwright test tests/contact.spec.ts` or `npx playwright test tests/contact-fixture.spec.ts --project contact-fixture`. For mobile menu checks, use `npx playwright test tests/home.spec.ts --project repository-base --grep "mobile menu"`. A failed test retains a trace in `test-results/`; layout tests also save desktop/mobile screenshots there for visual review.

Run `npx playwright test tests/seo.spec.ts` to check every available route's localized metadata, canonical URLs, indexing, equivalent-page links, loaded assets, crawlability and sitemap across demonstration and launch fixtures. The tests exercise generated artifacts and browser behavior, using explicitly isolated readiness settings; they do not approve the actual placeholder content. Test servers explicitly set their publication mode, regardless of the calling shell's environment.

The tests use only the delivered website: direct language routes, navigation, switching, mobile keyboard/menu behavior, metadata, crawling, loaded assets, narrow-screen reflow, and navigation without JavaScript. Supplement automation with visual review of both languages, keyboard focus, contrast, and browser zoom. Automated checks do not establish WCAG conformance.

## Settings and deployment paths

`src/config/site.ts` centralizes the origin, deployment base and publication state, and exposes shared contact settings from `src/config/contact.ts`. Contact values remain `null` until verified data is supplied. Build-time environment variables override the deployment defaults:

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

The result is HTML, CSS and a small navigation script, requiring no production application backend. GitHub Pages remains the intended host; automated deployment is a subsequent slice of #8. No deployment or public launch is performed by this slice.

### Publication and search artifacts

Two controls determine indexing together:

- `SITE_PUBLICATION` accepts only `demonstration` (the default) or `launch`. An unrecognized value fails the build. Publishing a demonstration never changes this setting automatically.
- `src/config/readiness.ts` lists page identities whose **Greek and English content are both final, verified and approved**. The list is currently empty because every page still contains provisional material. A page omitted from the list stays `noindex` even in launch mode. Keep `services` omitted while its under-construction state remains.

| Mode | Ready page | Unready page, including unfinished Services |
| --- | --- | --- |
| Demonstration | `noindex, follow` | `noindex, follow` |
| Launch | `index, follow` | `noindex, follow` |

All pages have a self-canonical URL derived from the configured origin/base and common route registry. Only indexable translated pairs receive reciprocal `el`/`en` hreflang links. `/sitemap.xml`, relative to `SITE_BASE`, contains only indexable canonical URLs; it has no URL entries in demonstration mode or when no pages are ready. For the default project path its location is `https://laskasp.github.io/the-art-of-healing/sitemap.xml`. `robots.txt` allows crawling in both modes so crawlers can read `noindex`; search exclusion is not access control.

When public launch is approved, first supply final content and verified practice details, review both translations and visual presentation, and list only completed page identities in `readyPages`. Set the actual public origin/base, explicitly set `SITE_PUBLICATION=launch` in the build environment, rebuild, and inspect the resulting metadata and sitemap before publication. A local policy check in PowerShell is:

```powershell
$env:SITE_PUBLICATION = 'launch'
npm run build
# With the current empty readiness list, every page still remains noindex.
Remove-Item Env:SITE_PUBLICATION
npm run build
```

Do not approve placeholder pages to test launch behavior: the browser suite supplies its own isolated readiness fixture. Adding a new registry page leaves it excluded from indexing until both controls permit it. When final content replaces placeholders, update the acceptance tests' expected localized metadata as part of that content change.

Custom-domain purchase/provisioning, DNS changes, final content/visual approval and Search Console verification on the final domain remain later work. Domain configuration and Search Console verification do not themselves override `noindex`. No visitor analytics or unverified business/professional structured data is generated.

## Editing and extending

### Supplying verified contact details

Edit `src/config/contact.ts` after the actual practice details have been verified. `site.contact` exposes this single source to the Contact template and any future footer contact presentation; do not duplicate values in page copy or layouts.

| Field | Verified value to supply |
| --- | --- |
| `telephone` | An international telephone number beginning with `+` and country code, followed by digits without spaces; used as visible text and the `tel:` destination. |
| `email` | The actual email address, used as visible text and the `mailto:` destination. |
| `address` | An object with `el` and `en` strings for the same Athens office address. Use `\n` for line breaks if needed. |
| `workingHours` | An object with `el` and `en` strings describing the same verified schedule; line breaks are supported. |
| `directionsUrl` | The verified HTTPS Google Maps directions URL for that Athens office, opened as an ordinary external link in the same tab. Check that it leads to the correct office. |

Keep any unavailable field `null`. Each missing field renders an explicit localized placeholder and produces no contact link. The address and working hours require both translations. Athens remains the only physical office; Korinthos is part of the service area. Contact headings, metadata, placeholder wording and geography text live together in `src/content/contact.ts`; actual contact values belong only in the shared settings. No contact values are currently repeated in the footer.

Rebuild after changing settings, inspect both `/contact/` and `/en/contact/` under the configured base, and check the phone, email and directions destinations. `tests/fixtures/contact.ts` contains conspicuously marked test data for the isolated supplied-details acceptance build; never copy its values into the production settings. The normal Contact tests expect missing details until real data is supplied, so update those expectations when supplying verified values. Adding real details does not change the demonstration's `noindex` state.

### Page sources and templates

- `src/config/pages.ts` holds stable page identities, localized routes and navigation labels. Only implemented pages appear in navigation. The same registry drives route generation and equivalent-page language links.
- `src/content/home.ts`, `biography.ts`, `services.ts` and `contact.ts` each contain both languages of one page, including titles and descriptions. Keep page copy in its bilingual content module. `src/config/interface.ts` holds shared interface wording.
- `src/pages/[...path].astro` generates both localized static URLs; `src/layouts/SiteLayout.astro` and `src/components/` provide shared presentation.
- `src/styles/main.css` begins with editable theme colors and the system-font stack, followed by base/component rules. `src/styles/responsive.css` is loaded afterward for responsive overrides. The earth-tone palette and text-only provisional logo await visual approval; no final logo asset is claimed.

To add a normal content page:

1. Create `src/content/example.ts` exporting an object with `el` and `en` entries. Each entry follows `PageContent` from `src/content/page.ts`: localized `title`, `description`, `heading`, `introduction`, and `sections` (each with a `heading` and `text`). Use `satisfies Record<'el' | 'en', PageContent>` to check both translations. See Biography for an example.
2. Add an entry in `src/config/pages.ts` with a unique `id`, `template: 'content'`, `routes: { el: 'example', en: 'en/example' }`, localized `labels`, and the imported bilingual `content`. Routes omit leading/trailing slashes and the deployment base. The registry automatically adds both static URLs, navigation links, active-page state and equivalent-page language switching.
3. Reuse `ContentPage.astro` and `SiteLayout.astro`; no separate language templates or route files are needed. `illustrationAlt` optionally enables the existing under-construction graphic with a localized alternative (as used by Services). Introduce a new shared template only for a genuinely different structure, select it in the route renderer, and reuse it across languages. Home keeps its own presentation.
4. Run `npm run check` and extend the browser acceptance suite to open both new URLs, navigate and switch languages at both deployment bases. Run `npm test` and inspect mobile/desktop presentation before committing.

Continue using one source per translation pair, ordinary links, verified facts, and the same browser acceptance seam. Add future page slices through the GitHub tracker; do not maintain duplicate local issue files.

Home and Biography use text only. Services imports a small SVG construction graphic, with localized alternative text and reserved dimensions; Astro generates its base-aware asset URL. Future meaningful images also need suitable alternative text and reserved dimensions. No booking, enquiry form, embedded map or visitor analytics is included.
