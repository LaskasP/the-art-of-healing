# The art of healing

A static Astro demonstration for one psychologist, with Greek Home at the deployment root and English Home at `en/`. Content and branding are explicitly provisional. The remaining page slices are tracked under [implementation specification #8](https://github.com/LaskasP/the-art-of-healing/issues/8).

## Local development

Use Node.js 22.23.4 or newer (Node 24 LTS recommended) and npm. Install the locked dependencies and the acceptance-test browser:

```powershell
npm ci
npx playwright install chromium
npm run dev
```

By default, open `http://localhost:4321/the-art-of-healing/` or `http://localhost:4321/the-art-of-healing/en/`. There is no browser-language redirection. `npm run dev -- --host 127.0.0.1` limits development access to this machine.

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
- `src/content/home.ts` contains both languages of Home copy, including titles and descriptions. Keep page copy in its bilingual content module. `src/config/interface.ts` holds shared interface wording.
- `src/pages/[...path].astro` generates both localized static URLs; `src/layouts/SiteLayout.astro` and `src/components/` provide shared presentation.
- `src/styles/main.css` begins with editable theme colors and the system-font stack, followed by base/component rules. `src/styles/responsive.css` is loaded afterward for responsive overrides. The earth-tone palette and text-only provisional logo await visual approval; no final logo asset is claimed.

To add a page with the current presentation, create its bilingual content module, register its identity/routes/labels/content in `pages.ts`, and reuse the shared template. For a genuinely different structure, add a shared template and select it in the route renderer. Continue using one source per translation pair, ordinary links, verified facts, and the same browser acceptance seam. Add future page slices through the GitHub tracker; do not maintain duplicate local issue files.

The initial Home uses text only, with no image downloads or image layout shifts. Any later meaningful images need suitable alternative text and reserved dimensions. No booking, enquiry form, embedded map or visitor analytics is included.
