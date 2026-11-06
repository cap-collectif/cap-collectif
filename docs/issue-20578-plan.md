# Plan d’implémentation — Issue #20578

## Objectif

Créer un plan de site HTML dynamique, accessible et généré à chaque chargement, sur une nouvelle URL publique.

La page client existante `/pages/sitemap` est une page personnalisée et reste inchangée.

## Périmètre

### Inclus

- Nouvelle page publique `/sitemap`.
- Lien vers l’accueil en tête de page.
- Rubriques du menu principal et leurs sous-rubriques jusqu’à deux niveaux.
- Indication visuelle et accessible des liens externes.
- Projets participatifs non archivés dont la première étape existe et est activée.
- Étapes des projets en cours, avec participation ouverte ou à venir.
- Projets terminés affichés uniquement avec leur lien projet.
- Liens du menu du pied de page, y compris les liens légaux activés ; exclure les réseaux sociaux et le contenu libre.
- Lien « Plan de site » ajouté en dernier dans le pied de page de toutes les plateformes.
- Structure sémantique `h1`, `h2`, `h3` sans modification visuelle générale.
- Couleur des liens de la plateforme et liens soulignés.

### Exclus

- Modification ou suppression de `/pages/sitemap`.
- Modification du sitemap XML `/sitemap.xml`.
- Mise en place d’une invalidation événementielle ou d’un stockage persistant : les données sont relues au chargement de la page.

## Décisions fonctionnelles

### URL

- Utiliser `/sitemap` pour le nouveau plan de site HTML.
- Conserver `/pages/sitemap` comme page personnalisée existante.
- Conserver `/sitemap.xml` pour le sitemap XML SEO.

### Projets

- N’afficher que les projets qui possèdent au moins une étape.
- Exclure les projets archivés.
- Inclure les projets publics non archivés.
- N'afficher que les projets de la langue courante et ceux sans langue définie, comme sur `/projects`.
- Trier les projets par date de publication décroissante, comme sur `/projects`.
- Pour les projets `OPENED`, `OPENED_PARTICIPATION`, `FUTURE_WITHOUT_FINISHED_STEPS` et `FUTURE_WITH_FINISHED_STEPS`, afficher les étapes activées.
- Pour les projets `CLOSED` possédant au moins une étape, afficher uniquement le lien du projet.
- Pour les statuts inconnus ou non prévus, afficher uniquement le lien du projet par défaut lorsque le projet possède au moins une étape.
- Exclure les projets publics sans étape, même s’ils ne sont pas archivés.
- Exclure les projets dont la première étape est absente ou désactivée : leur URL publique redirige vers cette étape et ne serait pas accessible.
- Le lien projet doit être construit depuis le slug du projet (`/project/{slug}`), sans réutiliser l’URL d’une étape.
- Les étapes doivent utiliser leur titre et leur URL publique.

## Plan technique

### 1. Page Next.js

Rendre la page avec le front-office Next.js :

- Conserver la route Symfony `/sitemap` pour les contrôles de locale et transférer son rendu à Next.js.
- Utiliser `admin-next/src/app/sitemap/Sitemap.tsx` pour le contenu du plan de site et une requête GraphQL interne pour ses données.
- Réutiliser les données du menu principal pour conserver le filtrage et les traductions du header existant.
- Reprendre `getFooterLinks()` et `getLegalsPages()` pour rester aligné avec le menu du footer de base, sans réseaux sociaux ni contenu libre.
- Rendre la page dynamique afin que les changements soient visibles au prochain chargement.
- Ne pas mettre en cache la réponse HTML ni les données de menu et des liens légaux utilisées par le plan de site.
- Ajouter explicitement le soulignement des liens sur cette page.

### 2. Données serveur

Réutiliser les mécanismes existants autant que possible :

- Charger les projets publics non archivés via une requête Doctrine avec jointure sur les étapes.
- Charger les projets et leurs étapes dans une seule requête afin d’éviter un chargement des étapes projet par projet.
- Exclure les projets sans étape directement dans cette requête.
- Utiliser `StepUrlResolver` pour générer les URLs publiques des étapes.
- Construire l’URL du projet depuis son slug, sans réutiliser l’URL d’une étape.

Ne pas ajouter de mutation ni de nouveau modèle de données. Aucune pagination supplémentaire n’est nécessaire : l’instance la plus importante compte actuellement 552 projets.

### 3. Lien du footer

Ajouter le lien système en dernier, sans dépendre d’une fixture ou d’un élément configuré par le client :

- `src/Capco/AppBundle/Twig/FooterRuntime.php` pour le footer legacy.
- `src/Capco/AppBundle/GraphQL/Resolver/FooterSocialNetworksResolver.php` pour le footer Next/GraphQL.
- Conserver l’indication de lien externe pour les liens configurés par le client.
- Ajouter la traduction du libellé « Plan de site » selon la convention de traduction du projet.

Le lien doit être présent sur les plateformes existantes et sur les nouvelles plateformes par défaut.

### 4. Routes localisées

- Déclarer `/sitemap` dans les catalogues de traduction de routes afin que les liens du footer génèrent `/sitemap` avec le préfixe de locale attendu.
- Les URLs préfixées comme `/en/sitemap` ne sont accessibles que lorsque le feature flag `multilangue` est actif et que la locale est publiée ; sinon elles doivent retourner un vrai HTTP 404. L’URL canonique reste `/sitemap`.
- Pour les liens et les libellés, utiliser la locale résolue par Symfony : un cookie de langue non publiée ou un multilingue désactivé entraîne un repli sur la locale par défaut de l’instance.
- La requête GraphQL utilise la locale de la requête Symfony ; les éventuelles divergences avec la langue du layout sont suivies dans l’issue #20677.
- Utiliser les traductions existantes pour le contenu localisé ; les catalogues générés ne doivent pas être modifiés manuellement.

### 5. Intégration

- Utiliser le middleware Next.js pour transmettre la locale de la route au front-office.
- Conserver les routes localisées Symfony générées pour `/sitemap`.
- La page utilise le layout front-office existant, avec la barre de navigation et le footer globaux. Les liens de leurs menus restent présents dans le contenu du plan de site.

## Tests à ajouter ou mettre à jour

### Next.js / intégration

Tester le rendu du plan de site avec des assertions HTML explicites :

- présence du lien d’accueil ;
- hiérarchie `h1` / `h2` / `h3` ;
- rendu des menus et sous-menus ;
- pictogramme et attributs des liens externes ;
- rendu des étapes pour les projets en cours, ouverts à la participation et à venir ;
- absence d’étapes pour les projets terminés ;
- absence des projets sans étape, y compris lorsqu’ils sont publics et non archivés ;
- exclusion des projets dont la première étape est absente ou désactivée ;
- exclusion des projets archivés ;
- soulignement et liens attendus.

Vérifier également que la requête de projets charge les étapes par jointure et ne déclenche pas un chargement par projet.

### Cypress

Ajouter un scénario de bout en bout sur `/sitemap` couvrant :

- l’accès à la page ;
- l’accès à `/en/sitemap` lorsque `multilangue` est activé, avec un statut HTTP 200 et le contenu anglais du sitemap ;
- le lien du footer vers `/sitemap` ;
- les rubriques principales ;
- l’absence d’un second lien « Accueil » dans l’arbre, puisque le lien avec pictogramme est déjà présent en tête ;
- l’absence de doublon du lien « Plan de site » dans le footer ;
- les projets et leurs étapes selon leur statut, avec des cas ouverts et continus ;
- l’exclusion d’un projet sans étape, d’un projet archivé et d’un projet dont la première étape est désactivée ;
- l’absence de la page personnalisée `/pages/sitemap` dans le périmètre du nouveau rendu.

Respecter les conventions Cypress du projet : flags déterministes, restauration des données si nécessaire, sélecteurs accessibles et absence d’attentes fixes.

### PHP / intégration

Si le changement du footer ou du backend nécessite des tests PHP, ajouter les tests ciblés correspondants. Avant tout commit contenant du PHP, exécuter les trois contrôles obligatoires : PHPStan, PHP-CS-Fixer en dry-run et Rector en dry-run dans le conteneur applicatif.

## Validation manuelle

- Vérifier `/sitemap` sur une plateforme existante et une plateforme nouvellement créée.
- Vérifier que `/pages/sitemap` conserve son contenu client.
- Vérifier que `/sitemap.xml` continue de répondre en XML.
- Vérifier les liens externes, leurs pictogrammes et leur ouverture dans un nouvel onglet.
- Vérifier la navigation clavier et la lisibilité des titres par un lecteur d’écran.
- Vérifier le rendu avec un grand nombre de projets.
- Vérifier qu’un projet public sans étape n’apparaît pas dans la rubrique des projets.

## Points de vigilance

- Le statut `à venir` doit être traité explicitement, contrairement à l’analyse initiale de l’issue.
- Ne pas utiliser le statut d’une étape pour décider du rendu du projet : la décision se fait sur le statut du projet.
- Ne pas ajouter « Plan de site » uniquement dans les fixtures : cela ne couvrirait pas les plateformes existantes et permettrait sa suppression depuis la configuration client.
- Éviter de confondre le lien du projet avec le lien de sa première étape.
- Ne pas générer de lien `/project/{slug}` pour un projet public sans étape.
- Les réseaux sociaux et le contenu libre du footer ne font pas partie des liens repris dans le sitemap.

## Résultat attendu

Une nouvelle page `/sitemap` qui reflète les contenus publics actuels au moment du chargement, sans modifier la page client `/pages/sitemap` ni le sitemap XML `/sitemap.xml`.
