export interface PageContent {
  title: string;
  description: string;
  heading: string;
  introduction: string;
  sections: { heading: string; text: string }[];
  illustrationAlt?: string;
}
