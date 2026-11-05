export interface ContentLink {
  // A registered page identity; the renderer resolves its localized, base-aware URL.
  page: string;
  label: string;
}

export interface ContentSection {
  heading: string;
  officeGallery?: boolean;
  invitation?: boolean;
  paragraphs?: string[];
  entries?: { heading: string; text: string }[];
  list?: string[];
  links?: ContentLink[];
}

export interface PageContent {
  title: string;
  description: string;
  heading: string;
  headingAttribution?: string;
  eyebrow?: string;
  paragraphs: string[];
  links?: ContentLink[];
  sections: ContentSection[];
}
