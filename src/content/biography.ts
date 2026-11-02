import type { PageContent } from './page';

export const biography = {
  el: {
    title: 'Βιογραφικό | Η τέχνη της ίασης — Δομικό δείγμα',
    description: 'Προσωρινή σελίδα βιογραφικού. Το εγκεκριμένο βιογραφικό του ψυχολόγου θα προστεθεί αργότερα.',
    heading: 'Βιογραφικό',
    introduction: 'Δομικό δείγμα — το περιεχόμενο αυτής της σελίδας δεν είναι τελικό.',
    sections: [{ heading: 'Θέση για εγκεκριμένο βιογραφικό', text: 'Εδώ θα προστεθεί το βιογραφικό του ψυχολόγου, αφού δοθούν και επιβεβαιωθούν τα στοιχεία. Δεν έχουν προστεθεί στοιχεία σπουδών, επαγγελματικών προσόντων ή εμπειρίας.' }],
  },
  en: {
    title: 'Biography | The art of healing — Structural demonstration',
    description: 'A placeholder biography page. The psychologist’s approved biography will be added later.',
    heading: 'Biography',
    introduction: 'Structural demonstration — the content of this page is provisional.',
    sections: [{ heading: 'Placeholder for approved biography', text: 'The psychologist’s biography will appear here once the details have been supplied and verified. Education, professional qualifications and experience have not yet been added.' }],
  },
} satisfies Record<'el' | 'en', PageContent>;
