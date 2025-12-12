# ADR 001 - Le code personnalisé

## Gestion du code personnalisé (CSS/JS)

### Contexte
Dans le cadre de notre plateforme, il est parfois nécessaire d'injecter du code CSS et/ou JavaScript personnalisé directement dans une instance spécifique d'un client.
Cette fonctionnalité permet d'appliquer des personnalisations visuelles ou comportementales sans modifier le code source principal de l'application.

Le code personnalisé est très difficile à maintenir, et il peut compromettre l'accessibilité.
Il n'est donc pas recommandé et est utilisé uniquement pour des cas exceptionnels où aucune autre solution n'est possible.

### Bonnes pratiques
- **Toujours** utiliser les balises `<style>` et `<script>`
- Ne rien écrire en-dehors de ces balises
- Documenter les modifications dans l'issue GitHub associée
- Indenter correctement le code pour faciliter la lecture et la maintenance (le faire dans un éditeur de code et copier-coller si besoin)
- Ajouter des commentaires explicites (pensez à la personne qui pourrait devoir le mettre à jour dans 1 an)
- Séparer le code en blocs logiques avec des commentaires de séparation


### Pourquoi ça existe ?
  - Parfois, on n'a pas d'autre choix :biz666:
  
### Pourquoi ce n'est pas recommandé ?
  - Risque de diminuer l'accessibilité de la plateforme
  - Risque de casser à chaque déploiement (ex : si on remplace une div par une span ou qu'on change une classe, alors qu'on ciblait cet élément en CSS --> ça ne fonctionne plus. Et bon courage pour débuguer ça 🤷🏻‍♀️)
  
### Exemple

```html
<!-- CSS personnalisé -->
<style>
    /* Documenter l'élément concerné avec un commentaire de début et de fin pour faciliter la relecture, ex : */
    /* HEADER */
    .header {
        color: #333;
        font-size: 2rem;
    }
    /* END HEADER */

    /* FOOTER */
    .footer {
        color: #333;
        font-size: 2rem;
    }
    /* END FOOTER */

    /* PRIMARY BUTTONS */
    .primary-button {
        color: #333;
        font-size: 2rem;
    }
    /* END PRIMARY BUTTONS */
</style>

<!-- JavaScript personnalisé -->
<script>
  (function() {
    'use strict';
    // Code JS ici
  })();
</script>
```