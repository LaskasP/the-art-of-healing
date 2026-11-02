export interface ContactDetails {
  telephone: string | null;
  email: string | null;
  address: { el: string; en: string } | null;
  workingHours: { el: string; en: string } | null;
  directionsUrl: string | null;
}

// Supply verified values only. Null means the detail has not yet been supplied.
export const contact: ContactDetails = {
  telephone: null,
  email: null,
  address: null,
  workingHours: null,
  directionsUrl: null,
};
