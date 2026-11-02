# Self-hosted fonts

Noto Sans (body, weights 400–600) and Noto Serif (headings, weight 400), normal style. Greek, Greek extended, Latin and Latin extended subsets are checked into this folder as WOFF2 files. The build requires no font download and browsers make no requests to Google Fonts.

`src/styles/fonts.css` defines the faces and Unicode ranges; `src/styles/main.css` selects the font families. The shared layout preloads the Greek/Latin subsets for both families, and `font-display: swap` keeps text visible during loading. Other subsets load only when needed.

`sources.json` records the download URLs, sizes and SHA-256 checksums. Source: [Google Fonts Noto](https://fonts.google.com/noto/). Both families are distributed under the SIL Open Font License 1.1; the original notices and licence texts are included in `public/font-licenses/` and therefore ship with the built site. Keep them with any redistribution of the fonts.

To update fonts, obtain WOFF2 subsets from the recorded official source, preserve the original licence notices, update the checksums and verify Greek/English, local font loading, first paint and mobile reflow before committing.
