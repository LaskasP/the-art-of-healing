import type { PageContent } from './page';

export const services = {
  el: {
    title: 'Υπηρεσίες | Η τέχνη της ίασης — Δομικό δείγμα',
    description: 'Η σελίδα υπηρεσιών είναι υπό διαμόρφωση. Οι εγκεκριμένες πληροφορίες θα προστεθούν αργότερα.',
    heading: 'Υπηρεσίες',
    introduction: 'Δομικό δείγμα — οι πληροφορίες για τις υπηρεσίες δεν είναι ακόμη διαθέσιμες.',
    illustrationAlt: 'Υπηρεσίες υπό διαμόρφωση',
    sections: [{ heading: 'Υπηρεσίες υπό διαμόρφωση', text: 'Η σελίδα βρίσκεται υπό κατασκευή. Οι πληροφορίες για τις υπηρεσίες θα προστεθούν αφού δοθούν και εγκριθούν.' }],
  },
  en: {
    title: 'Services | The art of healing — Structural demonstration',
    description: 'The Services page is under construction. Approved information will be added later.',
    heading: 'Services',
    introduction: 'Structural demonstration — information about services is not yet available.',
    illustrationAlt: 'Services under construction',
    sections: [{ heading: 'Services under construction', text: 'This page is being prepared. Information about services will be added once it has been supplied and approved.' }],
  },
} satisfies Record<'el' | 'en', PageContent>;
