import details from '../content/contact-details.json';

export interface ContactDetails {
  instagramUrl?: string | null;
  telephone: string | null;
  email: string | null;
  address: { el: string; en: string } | null;
  workingHours: { el: string; en: string } | null;
  directionsUrl: string | null;
}

// Public practice details are edited in the content file, not application code.
export const contact: ContactDetails = details;
