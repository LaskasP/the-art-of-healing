# Editing website content

Edit the UTF-8 JSON files here. No template or TypeScript changes are needed to change wording, metadata, section order or existing contact details. These files are part of the website source and should be committed. The separate root `/content/` folder contains private/reference material and is not used by the website build.

| File | What to edit |
| --- | --- |
| `home.json` | Home page text, search title/description, session summaries and calls to action |
| `biography.json` | Biography text, education list and professional/personal sections |
| `services.json` | Services text, first-meeting section and FAQ questions/answers |
| `contact.json` | Contact page text, labels, professional description and session languages |
| `contact-details.json` | Shared telephone, email, address, working hours, Maps URL and Instagram profile URL |
| `interface.json` | Brand name, navigation labels, menu/accessibility wording, language names and footer |

The page/interface files have `el` and `en` entries. Keep the two versions aligned when editing facts or adding sections. The small `.ts` files only import/check the data; leave them alone when editing copy.

## Page structure

Home, Biography and Services share this structure within each language:

```json
{
  "title": "Search/browser title",
  "description": "Search description",
  "heading": "Page heading",
  "paragraphs": ["First introduction paragraph.", "Another paragraph."],
  "links": [{ "page": "contact", "label": "Get in touch" }],
  "sections": [
    {
      "heading": "Section heading",
      "paragraphs": ["Section text."],
      "list": ["An optional list item."],
      "entries": [{ "heading": "A question or service name", "text": "Its answer or description." }],
      "links": [{ "page": "services", "label": "Explore services" }]
    }
  ]
}
```

`title`, `description`, `heading`, `paragraphs` and `sections` are required on these pages. `eyebrow` is an optional short line above the page heading. `headingAttribution` is an optional author credit directly below the main heading; keep it aligned in both languages when quoting someone. Within sections, only `heading` is required; omit any unused `paragraphs`, `list`, `entries` or `links`. Array order controls reading order. Entries render as subheadings and descriptions; use them for service summaries or FAQ questions. List items render as a normal bullet list.

Text is plain text, not Markdown or HTML. Use separate strings for paragraphs, rather than `<p>` tags. Double quotes inside JSON strings must be escaped as `\"`. JSON does not allow comments or trailing commas.

Two optional section flags control presentation: `officeGallery: true` adds the office photographs, and `invitation: true` gives a section the dark teal invitation treatment. Keep these flags aligned in both languages. They move with their section when you reorder the content.

## Photographs and visual design

Original photographs live in `assets/photos/`. `ContentPage.astro` uses the session-room photo (`office/main-area-side.jpeg`) for Home, the office detail (`office/office-table-side.jpeg`) for Services and the Home gallery, and the supplied personal photo for Biography. `Contact.astro` uses `office/office-table.jpeg`. Astro generates optimized, responsive image files at build time. The 200 × 200 portrait is displayed at its original size. Image descriptions are translated in `interface.json` under `images`.

The teal palette, heading/body font families, spacing and component styles are centralized in `src/styles/main.css`; breakpoint overrides live in `src/styles/responsive.css`. Typography uses self-hosted Noto Serif headings and Noto Sans body text with Greek/English support, without external font requests. Font files and provenance are in `src/assets/fonts/`, face declarations in `src/styles/fonts.css`, and the original licences in `public/font-licenses/`.

For internal calls to action, `page` is one of `home`, `biography`, `services`, or `contact`. The renderer creates the correct language URL and deployment prefix. Do not hardcode `/en/` or the GitHub Pages project path in these links. Unknown page identities fail the build rather than emitting a broken link. Adding an entirely new page still requires registering its routes in `src/config/pages.ts`.

## Contact details

Update actual values in `contact-details.json`, not in the component or localized page labels. Keep the telephone in international form without spaces, for example `+306980337500`; it is used for the telephone link. `address` and `workingHours` contain `el`/`en` translations; `\n` can be used for a line break. `directionsUrl` is an ordinary external link. `instagramUrl` controls the shared footer profile link; omit it or set it to `null` to hide the link. Its accessible label is translated in `interface.json` as `instagramLabel`. A missing detail can be set to `null`, which displays the localized `missing` wording rather than a fabricated link.

Contact labels, the professional name/qualification, service-area description and the session-language statement live in `contact.json`. Session languages are a confirmed practice fact, separate from the website language switch.

## Preview and check

1. Save the JSON file; `npm run dev` reloads the page automatically.
2. Review both languages, including the relevant links and mobile layout.
3. Run `npm run validate` and `npm run build` before committing. Update independent browser expectations if a deliberate change alters a fact they check.

Changing content does not publish the site or turn on search indexing. Publication settings remain in `src/config/site.ts` and `src/config/readiness.ts`.
