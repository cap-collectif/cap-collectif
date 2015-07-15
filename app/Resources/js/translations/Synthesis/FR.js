export default {
  locales: ['fr-FR'],
  messages: {
    common: {
      elements: {
        nb: '{num, plural, =0{} one{# contribution} other{# contributions}}',
        default_title: 'Contribution',
        no_source_date: 'Date non renseignée',
      },
      errors: {
        not_enabled: 'La synthèse est en cours de rédaction et sera bientôt disponible.',
        no_synthesis: 'La synthèse n\'a pas encore été rédigée. Elle sera disponible prochainement.',
        incorrect_mode: 'Un problème est survenu. Veuillez réessayer.',
        update_error: 'Une erreur est survenue, merci de réessayer cette action ultérieurement.',
        close: 'Fermer',
      },
    },
    view: {
    },
    edition: {
      menu: {
        contributions: 'CONTRIBUTIONS',
        inbox: 'Non traitées',
        archived: 'Traitées',
        reported: 'Signalées',
        trashed: 'Corbeille',
        unpublished: 'Dépubliées',
        all: 'Toutes',
        tree: 'Arborescence',
        new_folder: 'Nouveau dossier',
      },
      inbox: {
        none: 'Aucune contribution à afficher.',
      },
    },
  },
};
