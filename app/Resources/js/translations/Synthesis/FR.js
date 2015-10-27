export default {
  locales: ['fr-FR'],
  messages: {
    common: {
      elements: {
        nb: '{num, plural, =0{# contribution} one{# contribution} other{# contributions}}',
        default_title: 'Contribution',
        no_source_date: 'Date non renseignée',
        more: 'Voir plus',
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
      loading: 'Chargement',
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
      navbar: {
        search: 'Rechercher',
        user: {
          admin: 'Administration',
          profile: 'Mon profil',
          settings: 'Paramètres',
          logout: 'Déconnexion',
        },
        second: {
          brand: 'Synthèse (Version beta)',
        },
        filter: {
          oldest: 'Les plus anciens',
          newest: 'Les plus récents',
          popular: 'Les plus populaires',
        },
      },
      topMenu: {
        inbox: 'À traiter',
        archived: 'Traitées',
        published: 'Classées',
        unpublished: 'Ignorées',
        all: 'Toutes',
      },
      sideMenu: {
        contributions: 'Les contributions',
      },
      list: {
        none: 'Aucun élément.',
      },
      finder: {
        root: 'Synthèse',
      },
      action: {
        create: {
          label: 'Nouveau dossier',
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
        manage: {
          label: 'Gérer les dossiers',
        },
        publish: {
          btn_cancel: 'Annuler',
          btn_submit: 'Classer',
          help: {
            notation: 'Sélectionner des étoiles pour noter.',
          },
          field: {
            comment: 'Annoter',
            notation: 'Noter',
            parent: 'Déplacer',
            title: 'Titre',
          },
          optional: 'Facultatif',
          title: 'Classer...',
        },
        update: {
          btn_cancel: 'Annuler',
          btn_submit: 'Modifier',
          field: {
            parent: 'Déplacer',
            title: 'Titre',
          },
          title: 'Modifier le dossier',
        },
        divide: {
          title: 'Diviser la contribution',
          btn_cancel: 'Annuler',
          btn_submit: 'Diviser',
          help: {
            title: 'Information',
            message: 'Veuillez sélectionner du texte dans le contenu pour créer une nouvelle contribution.',
          },
          create_button: 'Créer à partir d\'une sélection',
        },
        confirm_ignore: {
          title: 'Souhaitez-vous vraiment ignorer le dossier "{name}"',
          body: 'Tous les dossiers et toutes les contributions contenus dans ce dossier seront également ignorés.',
          btn_cancel: 'Annuler',
          btn_submit: 'Ignorer',
        },
      },
    },
    vote: {
      ok: 'D\'accord',
      mitige: 'Mitigé',
      nok: 'Pas d\'accord',
      total: '{nb, plural, =0{# vote} one{# vote} other{# votes}}',
    },
    counter: {
      contributions: '{nb, plural, =0{# contribution} one{# contribution} other{# contributions}}',
    },
    readmore: {
      show: 'Voir la synthèse de "{title}"',
      hide: 'Masquer la synthèse de "{title}"',
    },
  },
};
