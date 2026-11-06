# Cahier de recette — Plan de site dynamique

## Informations

- **Issue :** [#20578 — Plan de site dynamique](https://github.com/cap-collectif/platform/issues/20578)
- **PR :** [#20654](https://github.com/cap-collectif/platform/pull/20654)
- **Instance QA :** à renseigner après déploiement
- **Navigateur(s) :** Chrome ou Firefox, desktop et mobile
- **Date de recette :** à renseigner
- **Recetteur·ice :** à renseigner

## Objectif

Vérifier que le nouveau plan de site HTML est accessible depuis `/sitemap`, qu’il reflète les contenus publics de la plateforme au chargement de la page et qu’il ne modifie ni la page client `/pages/sitemap`, ni le sitemap XML `/sitemap.xml`.

## Pré-requis

- Disposer d’une instance QA déployée avec la branche de la PR.
- Disposer d’un compte administrateur ou d’un accès au back-office pour vérifier la configuration du site et, si nécessaire, créer les cas de test.
- Pour les tests multilingues, activer le multilingue et publier au moins l’anglais.
- Pour les tests de projets, utiliser des projets de l’instance QA correspondant aux statuts demandés ; ne pas dépendre des fixtures de développement.

## Cas de recette

<details>
<summary><input type="checkbox" aria-label="Valider RS-01"> RS-01 — Accès à la page</summary>

1. Ouvrir `/sitemap`.
2. Vérifier que la réponse est HTTP 200.
3. Vérifier que le contenu du plan de site s’affiche après le chargement de la page.
4. Vérifier que la barre de navigation et le pied de page globaux sont affichés comme sur les autres pages.

**Résultat attendu :** la page du plan de site s’affiche correctement.

</details>

<details>
<summary><input type="checkbox" aria-label="Valider RS-02"> RS-02 — Structure générale et accueil</summary>

1. Vérifier la présence du fil d’Ariane : « Accueil » puis « Plan du site ».
2. Vérifier la présence d’un seul lien « Accueil » avec l’icône maison dans le contenu principal.
3. Vérifier qu’un second lien « Accueil » n’est pas affiché dans l’arbre du menu.
4. Vérifier que l’icône maison est alignée verticalement avec le texte.

**Résultat attendu :** l’accueil est présent dans le fil d’Ariane et dans le bloc dédié, sans doublon dans l’arbre.

</details>

<details>
<summary><input type="checkbox" aria-label="Valider RS-03"> RS-03 — Menus et sous-menus</summary>

1. Configurer ou identifier une rubrique du menu principal avec une sous-rubrique.
2. Ouvrir `/sitemap`.
3. Vérifier la présence de la rubrique et de sa sous-rubrique.
4. Vérifier que les liens pointent vers les bonnes URLs.
5. Désactiver la fonctionnalité associée à une rubrique, si applicable.
6. Recharger la page.

**Résultat attendu :** les rubriques actives sont affichées avec leurs sous-rubriques ; les éléments désactivés ne sont pas affichés.

</details>

<details>
<summary><input type="checkbox" aria-label="Valider RS-04"> RS-04 — Liens externes</summary>

1. Configurer ou identifier un lien externe dans le menu principal ou le footer.
2. Ouvrir `/sitemap`.
3. Vérifier la présence du pictogramme de lien externe.
4. Vérifier que le lien s’ouvre dans un nouvel onglet.
5. Vérifier que le lien possède une indication textuelle compréhensible par un lecteur d’écran.

**Résultat attendu :** les liens externes sont clairement identifiés visuellement et vocalement.

</details>

<details>
<summary><input type="checkbox" aria-label="Valider RS-05"> RS-05 — Projets publics et non archivés</summary>

1. Ouvrir `/sitemap`.
2. Vérifier qu’un projet public non archivé est présent.
3. Vérifier que son lien utilise l’URL du projet, sous la forme `/project/{slug}`.
4. Vérifier qu’un projet archivé n’est pas présent.
5. Vérifier qu’un projet privé ou non accessible publiquement n’est pas présent.

**Résultat attendu :** seuls les projets publics non archivés sont affichés, par date de publication décroissante comme sur `/projects`.

</details>

<details>
<summary><input type="checkbox" aria-label="Valider RS-06"> RS-06 — Étapes selon le statut du projet</summary>

Vérifier les cas suivants avec des projets distincts :

| Cas | Vérification attendue |
| --- | --- |
| Projet en cours | Le projet et ses étapes activées sont affichés. |
| Projet avec participation ouverte | Le projet et ses étapes activées sont affichés. |
| Projet à venir | Le projet et ses étapes activées sont affichés. |
| Projet terminé | Le projet est affiché, mais aucune étape n’est affichée dessous. |

Pour chaque étape affichée, vérifier le titre et l’URL publique.

**Résultat attendu :** le contenu des étapes respecte le statut du projet, et les étapes désactivées ne sont jamais affichées.

</details>

<details>
<summary><input type="checkbox" aria-label="Valider RS-07"> RS-07 — Projets non accessibles</summary>

Vérifier les cas suivants :

1. Projet public sans étape.
2. Projet dont la première étape est désactivée.
3. Projet archivé.

**Résultat attendu :** aucun de ces projets n’apparaît dans le plan de site.

</details>

<details>
<summary><input type="checkbox" aria-label="Valider RS-08"> RS-08 — Footer et absence de doublons</summary>

1. Sur une autre page du site, vérifier la présence du lien « Plan du site » en dernier dans les liens du footer.
2. Vérifier que le lien pointe vers `/sitemap` ou vers la route localisée courante.
3. Configurer un lien footer client qui pointe déjà vers le sitemap.
4. Recharger `/sitemap`.
5. Vérifier que l’arborescence du plan contient les liens du menu et les liens légaux activés, mais pas les réseaux sociaux ni le contenu libre. Ces derniers restent affichés dans le footer global s’ils sont configurés.

**Résultat attendu :** le lien système est présent une seule fois et reste en dernière position.

</details>

<details>
<summary><input type="checkbox" aria-label="Valider RS-09"> RS-09 — Page courante dans le footer</summary>

1. Ouvrir `/sitemap`.
2. Repérer le lien « Plan du site » dans la liste des liens du footer affichée dans le plan de site.
3. Vérifier la présence de la pastille « Vous êtes ici » à droite du lien.
4. Vérifier son rendu sous forme de pastille arrondie avec le dégradé configuré.
5. Inspecter le lien et vérifier la présence de `aria-current="page"`.

**Résultat attendu :** le lien courant est identifiable visuellement et par les technologies d’assistance.

</details>

<details>
<summary><input type="checkbox" aria-label="Valider RS-10"> RS-10 — Multilingue et routes localisées</summary>

1. Activer le multilingue et publier l’anglais.
2. Ouvrir `/en/sitemap`.
3. Vérifier le statut HTTP 200.
4. Vérifier le contenu anglais : titre « Sitemap », « Homepage », « Participatory projects » et « You are here ».
5. Vérifier que les URLs du menu, des projets, des étapes et du footer utilisent le préfixe `/en/` lorsque la route est localisée.
6. Comparer avec `/en/projects` les projets éligibles au plan de site, puis refaire la vérification en français : un projet de l'autre langue est absent et un projet sans langue est présent dans les deux langues.

**Résultat attendu :** la page anglaise est rendue avec son contenu traduit et ses URLs localisées. Les projets affichés correspondent à la langue courante ou n'ont pas de langue définie.

</details>

<details>
<summary><input type="checkbox" aria-label="Valider RS-11"> RS-11 — Couleurs et rendu visuel</summary>

1. Modifier dans le back-office la couleur des liens de l’instance.
2. Recharger `/sitemap`.
3. Vérifier que les liens reprennent la couleur configurée.
4. Vérifier que la pastille « Vous êtes ici » reprend les couleurs globales des liens dans son dégradé.
5. Vérifier que les liens sont soulignés.
6. Vérifier qu’un titre de projet très long ne déborde pas de l’écran.

**Résultat attendu :** le rendu respecte les paramètres visuels de l’instance et reste lisible avec des contenus longs.

</details>

<details>
<summary><input type="checkbox" aria-label="Valider RS-12"> RS-12 — Accessibilité clavier et lecteur d’écran</summary>

1. Naviguer dans la page uniquement au clavier avec `Tab` et `Shift + Tab`.
2. Vérifier que tous les liens sont atteignables et que le focus est visible.
3. Utiliser le mode d’inspection du lecteur d’écran ou les outils d’accessibilité du navigateur.
4. Vérifier la présence d’un `h1`, des rubriques structurées et du fil d’Ariane.
5. Vérifier que l’icône maison est ignorée par le lecteur d’écran.
6. Vérifier que le lien courant du footer est annoncé comme courant grâce à `aria-current="page"`.

**Résultat attendu :** la page est navigable au clavier et sa structure est compréhensible avec un lecteur d’écran.

</details>

<details>
<summary><input type="checkbox" aria-label="Valider RS-13"> RS-13 — Non-régressions</summary>

1. Ouvrir `/pages/sitemap`.
2. Vérifier que la page personnalisée du client conserve son contenu.
3. Ouvrir `/sitemap.xml`.
4. Vérifier que la réponse est HTTP 200 et que le contenu est toujours un sitemap XML.
5. Vérifier une page classique du site et son footer.

**Résultat attendu :** la page client, le sitemap XML et le footer des autres pages restent inchangés, à l’exception de l’ajout du lien système demandé.

</details>

## Anomalies à relever

Pour chaque anomalie, préciser :

- l’URL et la langue utilisées ;
- le statut attendu et le statut observé ;
- le navigateur et la taille d’écran ;
- les étapes permettant de reproduire ;
- une capture d’écran ou une vidéo si nécessaire.

## Critères de validation

La recette est validée si :

- les cas RS-01 à RS-13 sont conformes ou justifiés ;
- aucune régression n’est constatée sur `/pages/sitemap` et `/sitemap.xml` ;
- les liens du footer ne sont pas dupliqués ;
- les parcours clavier et lecteur d’écran sont utilisables ;
- aucune anomalie bloquante ou majeure ne reste ouverte.
