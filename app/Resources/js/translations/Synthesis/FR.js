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
        create_error: 'Une erreur est survenue, merci de réessayer cette action ultérieurement.',
        update_error: 'Une erreur est survenue, merci de réessayer cette action ultérieurement.',
        archive_error: 'Impossible de traiter cet élément. Veuillez réessayer.',
        divide_error: 'Impossible de diviser cet élement.. Veuillez réessayer.',
        close: 'Fermer',
      },
      success: {
        create_success: 'L\'élément a été créé avec succès.',
        update_success: 'L\'opération a été réalisée avec succès.',
        archive_success: 'L\'élément a été traité avec succès.',
        divide_success: 'L\'élément a été divisé avec succès.',
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
      action: {
        create: {
          button: 'Nouveau dossier',
          title: 'Nouveau dossier',
          btn_cancel: 'Annuler',
          btn_submit: 'Créer',
          name: {
            label: 'Nom',
            placeholder: 'Nom du dossier',
          },
          parent: {
            label: 'Imbriquer sous',
          },
          optional: 'Facultatif',
        },
        publish: {
          title: 'Classer...',
          btn_cancel: 'Annuler',
          btn_submit: 'Classer',
          comment: {
            title: 'Annoter',
          },
          notation: {
            title: 'Noter',
            help: 'Sélectionner des étoiles pour noter.',
          },
          parent: {
            title: 'Déplacer',
          },
          optional: 'facultatif',
        },
        divide: {
          title: 'Diviser la contribution',
          btn_cancel: 'Annuler',
          btn_submit: 'Diviser',
          help: {
            title: 'Information',
            message: 'Veuillez sélectionner du texte pour créer une contribution.',
          },
          create_button: 'Créer à partir d\'une sélection',
        },
      },
      finder: {
        root: 'Synthèse',
      },
    },
  },
};
