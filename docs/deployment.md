# First GitHub Pages deployment

The first deployment is a **demonstration**, with every page marked `noindex, follow`. It includes the approved text and real contact details. It is publicly accessible once deployed; `noindex` is not access control. Public-launch indexing and any custom domain remain separate changes.

## Prepared workflow

`.github/workflows/pages.yml` runs on pull requests to `main`, pushes to `main`, and manual dispatch. It uses Node 24 and the committed npm lockfile. The build job installs Chromium, runs `npm run validate`, makes a fresh production build, and runs `npm run check:deployment`. A failure prevents the Pages upload/deployment. Pull requests validate but never deploy. Manual deployment is limited to `main`.

Tests create temporary builds; the final production build replaces `dist/` afterward. Only that fresh `dist/` is uploaded. The artifact check requires exactly the eight page routes, local fonts and font licences, excludes private/reference and test files, rejects fixture contact data, and checks demonstration `noindex` metadata. `.test-build/` is never uploaded.

The deployment job depends on the build and uses the `github-pages` environment with only `pages: write` and `id-token: write` permissions. Action versions are pinned to reviewed commit SHAs. Existing deployment jobs are allowed to finish rather than being interrupted by a later push.

## First publication

1. Review the working tree and include the complete website source, approved `src/content/*.json`, supplied public photographs, font assets/licences, npm lockfile, workflow, tests and documentation in the intended commit. Never add the ignored root `/content/` reference folder or `.test-build/`. The build does not require the private CV.
2. In [repository Pages settings](https://github.com/LaskasP/the-art-of-healing/settings/pages), choose **GitHub Actions** under **Build and deployment → Source**. Pages was not enabled when this preparation began. Use the `github-pages` environment's protection settings to restrict deployments to `main` if needed.
3. Commit and push the reviewed changes to `main` when publication is authorized. Alternatively, merge a reviewed pull request. A `main` push starts the workflow automatically. No custom token or secret is required for the built-in Pages actions.
4. Open [Actions](https://github.com/LaskasP/the-art-of-healing/actions), wait for **Validate and deploy GitHub Pages**, and approve its deployment if the environment requires review. A manual run from `main` is also available after the workflow is present there.
5. Verify the deployed site at <https://laskasp.github.io/the-art-of-healing/> and `/en/`. Check all four pages in each language, equivalent-page switching, mobile menu/keyboard focus, photographs, phone/email/Maps links, address/floor/hours, and Greek/English font rendering.
6. Confirm that font requests use the site's own origin, no requests go to Google Fonts, all pages remain `noindex, follow`, and the demonstration sitemap has no URL entries. Confirm that neither private source files nor test fixtures are publicly present.

Preparation does not change repository Pages settings, create a commit, push a branch or perform a deployment. Those actions occur only when explicitly requested.

## Configuration

The workflow defaults to `SITE_ORIGIN=https://laskasp.github.io` and `SITE_BASE=/the-art-of-healing/`. Repository Actions variables `SITE_ORIGIN` and `SITE_BASE` can override those values when the hosting address changes. The workflow explicitly sets `SITE_PUBLICATION=demonstration`; a repository variable cannot silently enable indexing.

For a custom domain later, configure DNS and the GitHub Pages custom domain, set the verified origin and `/` base in Actions variables, and rebuild. Review the real readiness list and explicitly change the workflow's publication stage only as part of approved public launch. Do not infer launch approval from content edits.

## Local release checks

```powershell
npm ci
npx playwright install chromium
npm run validate
npm run build
npm run check:deployment
npm run preview
```

`npm run check:deployment` inspects the current `dist/`; run it immediately after the final build using the same `SITE_PUBLICATION` environment. It does not deploy. Use the URL printed by preview; do not open generated HTML files directly.

## Maintenance and rollback

Edit copy using `src/content/README.md`; edit theme typography/colors in `src/styles/main.css`. Noto font files are checked in under `src/assets/fonts/`, including source URLs/checksums; original OFL notices ship under `font-licenses/`. Builds need no font service or private source documents.

Future `main` pushes repeat the gates before updating Pages. To restore a prior release, revert the faulty change in a new reviewed commit and push it through the same workflow. Do not overwrite unrelated changes or skip validation. A failed validation leaves the previously deployed site in place. Inspect failed workflow logs, reproduce locally, fix and rerun; do not upload fixture output as a workaround.

Official workflow reference: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
