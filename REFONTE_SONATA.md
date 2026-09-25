Ce document sert à centraliser les informations pour les refontes des pages sonata.
Il a vocation à être complété et utilisé par les outils IA, et doit être supprimé lorsque sonata aura été intégralement supprimé du projet.

Il peut être incrémenté et complété au fil des refontes si nécessaire.
Il sert à lister les étapes / informations nécessaires / utiles à ces refontes.

**Consigne pour les outils IA** : après chaque retour/correction de l'utilisateurice pendant une migration
(pas seulement quand c'est explicitement demandé), vérifier si ce retour révèle une information générique et
réutilisable pour de futures migrations — si oui, l'ajouter ici. Ne pas attendre la fin de la tâche ni une
demande explicite de mise à jour de la doc pour faire cette vérification.

## Contexte général

Toutes les pages d'administration encore construites avec Sonata (`src/Capco/AdminBundle/`, routes
`/admin/capco/...`) doivent progressivement être migrées vers `admin-next/` (Next.js 14 + TypeScript +
Relay + `@cap-collectif/ui`). La migration se fait **page par page, une PR par page**, en réutilisant au
maximum les patterns déjà en place dans `admin-next/` plutôt qu'en inventant de nouvelles conventions.

## Méthodologie pour migrer une page Sonata

1. **Identifier la Sonata Admin class** correspondante dans `src/Capco/AdminBundle/Admin/` (ex:
   `ProjectTypeAdmin.php`) pour lister : les champs affichés en liste, les champs éditables en formulaire,
   les actions disponibles (create/edit/delete/batch), et les éventuelles règles métier dans
   `postUpdate`/`postPersist`/`prePersist` (invalidation de cache, etc.) à ne pas perdre lors de la migration.
2. **Identifier l'entité Doctrine** associée (`src/Capco/AppBundle/Entity/`) pour connaître les champs réels
   et savoir si l'entité est traduisible (présence d'une entité `*Translation` / `TranslatableTrait`) ou non.
3. **Vérifier l'existant GraphQL** (`schema.internal.graphql` + `src/Capco/AppBundle/Resources/config/graphql/internal/`) :
   - Le type GraphQL existe-t-il déjà ? Est-il exposé en connection paginée (`XConnection`) ou en simple liste (`[X!]!`) ?
   - Les mutations `create`/`update`/`delete` existent-elles déjà ? Si non, il faudra les créer en suivant le
     pattern `Create/Update/DeleteUserTypeMutation` (voir `src/Capco/AppBundle/GraphQL/Mutation/`), avec le
     trio Input/Payload YAML + classe PHP + déclaration dans `InternalMutation.types.yaml` (voir AGENTS.md).
   - Le type est-il enregistré dans `GlobalIdResolver::AVAILABLE_TYPES` (nécessaire pour une query `node(id:)`,
     utile pour une page d'édition dédiée à `?id=`) ?
4. **Vérifier et reproduire les restrictions d'accès d'origine — ne jamais se contenter du check générique
   par défaut.** Sonata protège l'intégralité de `/admin/*` via une règle globale dans
   `config/packages/security.yaml` (`access_control: [{ path: ^/admin, roles: ROLE_ADMIN }]`, parfois affinée
   par des règles plus spécifiques au-dessus) — cette protection est **invisible dans la classe Admin
   elle-même**, il faut donc systématiquement vérifier `security.yaml` en plus de l'Admin class pour connaître
   le rôle réellement exigé par la page d'origine (`ROLE_ADMIN`, `ROLE_SUPER_ADMIN`, `ROLE_PROJECT_ADMIN`...).
   Une fois ce rôle identifié, s'assurer qu'il est bien reproduit côté `admin-next` :
   - `withPageAuthRequired` (utilisé par toutes les pages `admin-next`) **n'est pas équivalent** à
     `ROLE_ADMIN` : il autorise admin **OU** project admin **OU** organization member **OU** mediator — un
     périmètre bien plus large. L'utiliser seul ne suffit donc **pas** à protéger une page qui, sous Sonata,
     exigeait strictement `ROLE_ADMIN` (ou plus).
   - `rolesRequired` dans `SideBarItems.json` pilotait historiquement **seulement l'affichage du menu**
     (voir `SideBar.utils.ts`/`getSideBarItemsFiltered`), pas un contrôle d'accès — une utilisatrice qui
     connaît l'URL directe pouvait contourner ce filtre. **Ce n'est plus le cas** : `withPageAuthRequired`
     (dans `admin-next/utils/withPageAuthRequired.ts`) relit désormais lui-même le `rolesRequired` de la
     page demandée dans `SideBarItems.json` (via son URL) et l'applique côté serveur, en plus du check
     générique. **Résultat : aucune page n'a rien à faire de spécial** — `export const getServerSideProps =
     withPageAuthRequired` suffit partout, comme avant. Il suffit que l'entrée `rolesRequired` de la page
     dans `SideBarItems.json` soit correcte (`["admin"]` ou `["superAdmin"]`) pour que la restriction soit
     réellement appliquée, pas seulement visuelle. Le rôle effectif d'une page est l'**union** de son propre
     `rolesRequired` et de celui de son groupe englobant (ex: le groupe "Utilisateurs" est `["admin"]`, donc
     `/admin-next/user-types` est protégée même si son propre `rolesRequired` est `[]`) — ça correspond à ce
     que le menu affiche réellement (un item n'est visible que si le groupe **et** l'item l'autorisent).
     - `withPageAuthRequired` gère aussi, automatiquement, le cas où le viewer n'a pas (ou plus) accès à la
       page demandée — **rien à faire dans la page migrée**. Deux redirections possibles, chacune vers une
       page qui doit vivre sous `/admin-next/` et jamais à la racine (le reverse-proxy ne route que ces
       chemins vers l'app Next.js, tout le reste tombe sur Symfony) :
       - rôle insuffisant pour cette page précise, mais accès back-office valide par ailleurs →
         `/admin-next/403` (layout back-office).
       - aucun accès back-office exploitable (non connectée, ou connectée sans rôle BO) → page d'accueil
         publique (`/`).
       Voir `ADR/001-admin_next_authorization_errors.md` pour le détail et la justification de cette
       distinction.
   - L'endroit naturel pour une vraie restriction **côté GraphQL** (utile si la query/mutation n'est pas déjà
     couverte par le point précédent, ou si on veut protéger l'API elle-même) est le champ concerné
     (`access:` dans les yaml, ex: `access: "@=hasRole('ROLE_ADMIN')"` sur une mutation). **Mais avant
     d'ajouter/modifier un `access:` sur une query ou une mutation existante, chercher TOUS ses usages**
     (`grep` sur `frontend/js/` **et** `admin-next/`, pas seulement le nouveau composant qu'on écrit) :
     certains champs sont volontairement partagés avec le front-office public (ex: `projectTypes` alimente
     aussi le filtre public de la page `/projects`, accessible aux visiteurs non connectés) — les restreindre
     casserait cet usage légitime. En général la **mutation** (écriture) peut être restreinte sans risque,
     alors que la **query** (lecture) partagée doit souvent rester ouverte si la donnée est déjà publique
     ailleurs.
5. **Repérer une page `admin-next/` déjà migrée avec une structure similaire** pour copier le pattern plutôt
   que d'en inventer un nouveau. Voir la section "Patterns de référence" ci-dessous pour choisir le bon
   template selon la forme de la donnée (liste plate vs paginée, avec/sans traductions, avec/sans couleur...).
6. **Créer la page** dans `admin-next/pages/admin-next/<nom-en-kebab-case>.tsx` (le nom de fichier = la route).
7. **Créer le(s) composant(s)** dans `admin-next/components/BackOffice/<NomDeLaFeature>/` (PascalCase pour le
   dossier et les fichiers de composants).
8. **Choisir le mode de livraison — avec ou sans feature flag de migration — en demandant à l'utilisateurice
   lequel s'applique à la PR en cours.** Deux cas coexistent tant que les premières refontes ne sont pas toutes
   fusionnées :
   - **Sans feature flag** (PR ouvertes avant la décision d'utiliser un feature flag de migration, ex:
     `pages.blog`, `pages.projects`, `pages.events`) : la route Admin Next remplace définitivement la route
     Sonata **dans la PR de migration elle-même** — liens de menu (`SideBarItems.json`, `Sidebar.tsx`,
     `URL_MAP`) pointés directement sur `/admin-next/...`, et code/références Sonata de la page supprimés en
     suivant les consignes de nettoyage de l'étape 14 (ex: entrée de la catégorie dans
     `FeaturesCategoryResolver::$categories`). Les règles « avec feature flag » des étapes 8, 9 et 14 ne
     s'appliquent pas à ce cas ; leurs consignes de repérage et de nettoyage des références Sonata, si.
   - **Avec feature flag** (toute PR ouverte depuis cette décision) : règles ci-dessous, code Sonata conservé.

   Quand toutes les PR « sans feature flag » seront fusionnées, cette nuance sera retirée et la suppression du
   code Sonata sera interdite hors PR de nettoyage dédiée.

   **Avec feature flag : déployer la refonte derrière un feature flag dédié à la migration — ne pas remplacer
   définitivement les routes Sonata pendant la PR de migration.** Le feature flag fonctionnel existant de la page (ex:
   `members_list`) reste inchangé : il contrôle l'existence de la fonctionnalité, pas le choix entre Sonata et
   Admin Next. Tant que la migration n'est pas complètement généralisée :
   - conserver le code et l'URL Sonata existants, ainsi que la nouvelle page Admin Next ;
   - lorsque le feature flag de migration est désactivé, les menus doivent conserver le lien Sonata ; lorsqu'il
     est activé, ils doivent pointer vers la route Admin Next ;
   - protéger également l'accès direct à la route Admin Next avec ce feature flag : masquer ou rediriger un
     lien de menu seul ne protège pas une URL saisie manuellement ;
   - utiliser le même feature flag pour toutes les pages déjà migrées, afin d'activer progressivement la
     refonte sans multiplier les règles d'accès temporaires. Les pages non encore migrées restent naturellement
     sur Sonata.
   - lorsqu'une page sort définitivement du rollout, faire une PR de nettoyage dédiée : rendre son URL Admin
     Next permanente et supprimer ses références Sonata. Conserver le feature flag global et son mécanisme pour
     les autres pages encore en rollout.
9. **Maintenir les références de menu dans les deux interfaces** : il existe DEUX menus latéraux distincts,
   plus d'éventuelles autres références à traquer au cas par cas :
   (Les consignes « dépendre du feature flag » ci-dessous valent pour le cas « avec feature flag » de l'étape 8 ;
   sans feature flag, pointer directement les `href` et le préfixe d'`URL_MAP` sur la route Admin Next, sans
   conserver l'ancienne URL Sonata.)
   - `admin-next/components/BackOffice/SideBar/SideBarItems.json` : menu latéral utilisé par les pages
     `admin-next/` elles-mêmes (via `Layout.tsx`). Y faire dépendre le lien du feature flag de migration.
   - `frontend/js/components/Admin/Sidebar/Sidebar.tsx` : menu latéral **legacy**, affiché sur les pages
     encore rendues par Sonata/Twig. Y faire dépendre le `href` du `<SidebarLink>` correspondant du même
     feature flag.
   - `frontend/js/components/Admin/Sidebar/Sidebar.utils.tsx` (`URL_MAP`) : ce fichier liste, par groupe de
     menu (`projets`, `reglages`, etc.), les préfixes d'URL permettant au menu legacy de savoir quel
     sous-menu ouvrir par défaut selon l'URL courante (`window.location.href.includes(val)`). Conserver les
     deux préfixes pendant le rollout pour que le menu fonctionne sur Sonata comme sur Admin Next.
   - Ces deux fichiers `Sidebar.tsx`/`Sidebar.utils.tsx` ne pourront être supprimés que lorsque **toutes**
     les pages Sonata auront été migrées (ils sont partagés par toutes les pages Sonata restantes).
   - **Et ailleurs si besoin** : faire une recherche globale de l'ancienne URL Sonata (`grep -rn` sur tout le
     repo). Lorsqu'une référence Sonata est conservée dans un fichier de navigation ou de routes, l'annoter
     avec un commentaire **en anglais** indiquant qu'elle est maintenue pendant le rollout derrière le feature
     flag et devra être supprimée lors du nettoyage final, par exemple :
     ```typescript
     // Sonata route retained during the Admin Next migration rollout. Remove it with the migration feature flag.
     ```
10. **Si de nouvelles mutations/types GraphQL backend ont été ajoutés** (nouveaux fichiers yaml sous
   `src/Capco/AppBundle/Resources/config/graphql/internal/`), il faut, **dans cet ordre**, avant que
   `admin-next` puisse les consommer :
   1. `bin/console graphql:compile` (génère les classes PHP dans `src/Capco/AppBundle/GraphQL/__generated__`
      à partir des yaml — le bundle a `auto_compile: false`, donc cette étape est obligatoire et doit être
      faite **avant** l'étape suivante, sinon le nouveau type/la nouvelle mutation n'apparaît pas).
   2. `bin/console graphql:dump-schema --schema=internal --format=graphql --file=schema.internal.graphql --with-descriptions`
      (regénère `schema.internal.graphql` à la racine, utilisé par le compilateur Relay de `admin-next`).
   3. Un `bin/console cache:clear` peut être nécessaire avant l'étape 1 si le cache Symfony est déjà chaud
      et ne détecte pas les nouveaux fichiers yaml.
11. **Lancer `yarn relay` dans `admin-next/`** après avoir écrit les requêtes/fragments/mutations GraphQL
    (les artefacts générés vivent tous dans `admin-next/__generated__/`, pas de dossier colocalisé).
12. **Vérifier** : `yarn ts` (TypeScript), `yarn lint` (ESLint), et un test visuel réel dans le navigateur
    (le stack Docker local expose `capco_nextjs_1` sur le port 3000, proxifié derrière `https://capco.dev`).
    Si le serveur Next.js dev sert une erreur qui ne correspond plus au code sur disque (ex: référence à un
    import déjà supprimé) après plusieurs éditions rapides, c'est probablement un cache HMR périmé : un
    `docker restart capco_nextjs_1` force une recompilation propre. **Tester avec au moins deux comptes
    de rôles différents** (ex: un admin et un simple project admin) pour vérifier que la restriction d'accès
    de l'étape 4 fonctionne réellement (accès autorisé pour l'un, redirection/refus pour l'autre), pas
    seulement que la page s'affiche.
13. **Tests Cypress et vérification des tests existants** :
    - Ne pas chercher à lire / modifier les variables d'environnement, demander à la développeuse aux commandes de modifier les éléments nécessaires.
    - Vérifier les tests **Cypress** qui couvrent la page Sonata migrée, rangés dans `cypress/e2e/backOffice/<feature>/`
      (convention de dossier par feature, ex: `cypress/e2e/backOffice/project/`).
    - Si des tests **Cypress** existent déjà pour cette page, **vérifier qu'ils passent toujours** après la
      migration (les sélecteurs, les URLs, la structure du DOM ont pu changer) et les réparer si besoin.
    - Ne pas ajouter de scénarios Cypress superflus : beaucoup de pages admin sont peu utilisées, inutile
      d'alourdir la CI. Si un scénario semble réellement manquant/critique (ex: cas d'erreur non couvert,
      accès non testé), l'ajouter avec parcimonie — et **demander à l'utilisateurice confirmation** avant
      d'ajouter des tests non explicitement demandés si un doute existe sur leur utilité.
    - **Ne pas faire d'action base de données (`cy.task('run:sql', ...)`) dans un test Cypress sauf si
      explicitement demandé ou si ça s'avère nécessaire.** `cy.task('db:restore')` (déjà présent dans le
      `beforeEach` de la plupart des specs existantes) réinitialise déjà toute la base sur le snapshot de
      fixtures avant chaque test — un `run:sql` de nettoyage "au cas où" après ça est redondant si les
      données créées par le test utilisent un identifiant unique (ex: un titre suffixé par `Date.now()`), ce
      qui suffit à éviter toute collision entre runs sans toucher à la base.
      **Pour la précondition d'un test qui n'est pas celui qui teste la création (ex: `it('updates ...')`,
      `it('deletes ...')`), préférer réutiliser une ligne déjà présente grâce aux fixtures chargées par
      `db:restore`** plutôt que de créer une nouvelle ligne (via SQL, ou même via l'UI) juste pour la
      modifier/supprimer ensuite — ça ajoute une étape et une action qui ne font que dupliquer ce que le test
      `it('creates ...')` vérifie déjà. Exemple concret sur cette page : les tests `updates`/`deletes` de
      `footerSocialNetwork.cy.ts` éditent/suppriment directement une ligne de fixture existante (`'Linkedin'`,
      `'Facebook'`, seedées par `fixtures/Dev/FooterSocialNetwork.yaml`) au lieu d'en créer une au préalable ;
      seul `it('creates ...')` crée réellement une ligne, via le formulaire de l'UI (pas de `run:sql`). Ordre
      de préférence pour poser une précondition : 1) une ligne de fixture déjà là après `db:restore`, 2) créer
      via le formulaire de l'UI si le scénario a vraiment besoin d'une ligne fraîche/spécifique qu'aucune
      fixture ne fournit, 3) `run:sql` seulement si même l'UI ne permet pas de poser cet état (ex: état
      legacy/corrompu à reproduire).
14. **Ne pas supprimer le code Sonata dans la PR de migration (cas « avec feature flag » de l'étape 8 ; sans
    feature flag, ce nettoyage se fait dans la PR de migration elle-même, avec les mêmes consignes).** Il doit
    rester disponible tant que le feature flag de migration permet de revenir à la route historique. Le nettoyage
    des contrôleurs, templates, entrées de menu et URLs Sonata intervient dans une PR dédiée, une fois la refonte
    généralisée et le feature flag supprimé pour cette page.
    - **Cas des pages `/admin/settings/{category}/list`** (`SettingsController.php`, `SiteParameterAdmin.php`,
      `Settings/list.html.twig`, tous dans `src/Capco/AdminBundle/`) : ce contrôleur/template est **générique**,
      partagé par plusieurs catégories (`settings.global`, `settings.performance`, `settings.modules`,
      `settings.appearance`, `pages.*`...) via un paramètre de route `{category}`. Ne
      **jamais** le supprimer tant que toutes ces catégories n'ont pas été migrées — seule la migration de la
      **dernière** catégorie restante permettra de le supprimer entièrement. Lors du nettoyage final, retirer
      l'entrée de chaque catégorie devenue inutile dans la whitelist
      `FeaturesCategoryResolver::$categories` (`src/Capco/AdminBundle/Resolver/FeaturesCategoryResolver.php`) et,
      le cas échéant, le `if` spécifique à cette catégorie dans `SettingsVoter::canView`
      (`src/Capco/AppBundle/Security/SettingsVoter.php`) si un rôle particulier y était exigé — ne pas toucher
      au reste du contrôleur/admin/template.
    - Pour repérer ces enregistrements dispersés par catégorie (qui ne vivent pas dans un seul dossier dédié à
      la feature), grep sur **la chaîne de catégorie elle-même** (ex: `settings.performance`) en plus du nom de
      l'entité/du contrôleur — elle apparaît typiquement dans `FeaturesCategoryResolver`, un éventuel Voter, les
      clés de traduction (`admin.label.<category>`, à garder si réutilisées côté `admin-next`), et parfois
      `config/packages/admin.yaml` (tag `group:` du service Sonata admin) / `config/packages/sonata_admin.yaml`
      (groupes du dashboard) — vérifier ces deux derniers fichiers même s'ils ne contiennent souvent rien de
      spécifique à la catégorie migrée (l'admin `SiteParameter`/`SiteColor`/`SiteImage` y est enregistré une
      seule fois pour toutes les catégories, sous `admin.group.parameters`, sans filtre par catégorie).

## Patterns de référence dans `admin-next/`

> Certains fichiers cités dans ce document vivent sur des branches parallèles pas encore fusionnées : la doc est
> fusionnée avant le code qu'elle décrit, pour servir aux refontes menées en parallèle. Si un fichier cité
> n'existe pas sur la branche courante, le lire depuis sa branche (`git log --all --oneline -- <chemin>` puis
> `git show <sha>:<chemin>`) ou suivre la recette autonome correspondante quand il y en a une.

Selon la forme des données à afficher, s'inspirer du composant le plus proche :

- **Liste plate non paginée avec action d'édition en pencil** (~ce que fait `ProjectType`, `HttpRedirect`) :
  `admin-next/components/BackOffice/Redirection/CustomRedirection.tsx` — `Table` + `Table.Thead`/`Table.Th`
  par colonne + `Table.Tbody`/`Table.Tr`/`Table.Td` + `ButtonQuickAction icon={CapUIIcon.Pencil}` en dernière
  colonne.
- **Liste de cards à un seul "label"** (ex: `GlobalDistrict`) : `GeographicalAreasList.tsx` — `ListCard` +
  `ListCard.Item` + `ButtonQuickAction` (pencil/trash) dans un `ButtonGroup`.
- **Couleur des `ButtonQuickAction`** : le bouton d'édition (`icon={CapUIIcon.Pencil}`) doit avoir
  `variantColor="primary"`, le bouton de suppression (`icon={CapUIIcon.Trash}`) doit avoir
  `variantColor="danger"`.
- **Liste paginée (Relay connection) avec recherche / infinite scroll** : `ProjectList.tsx` / `PostList.tsx`
  (`usePaginationFragment` + `Table.Tbody useInfiniteScroll`) ou `UserGroupsList.tsx`.
- **Entité avec traductions multi-langues + media** : `UserTypesList.tsx` / `UserTypeModal.tsx` (Types de profil).
- **Formulaire de champ couleur** : utiliser `FieldInput type="colorPicker"` (du package `@cap-collectif/form`,
  wrapper autour de `ColorPicker` de `@cap-collectif/ui`) — voir l'exemple dans
  `admin-next/components/BackOffice/Steps/ProposalStep/ProposalStepStatuses.tsx`. Ne pas réinventer un input
  color custom.
- **Page d'édition dédiée avec `?id=` en query param** (plutôt qu'une modale) : voir le couple
  `pages/admin-next/geographical-area.tsx` (lecture via `node(id:)` + `useUrlState('id', '')`) et
  `components/BackOffice/GeographicalArea/GeographicalAreaForm.tsx`.
- **Page "wrapper" standard** : toute page admin-next suit le même squelette —
  `Layout navTitle={...}` + `Suspense fallback={<Spinner .../>}` + `export const getServerSideProps = withPageAuthRequired`.
  Le rôle requis (le cas échéant) se règle dans `rolesRequired` de `SideBarItems.json`, pas dans le code de
  la page — voir l'étape 4 de la méthodologie ci-dessus.
- **Bouton booléen (activer/désactiver un champ simple)** : ne pas faire un bouton texte "Activer"/"Désactiver" —
  utiliser le composant `Switch` de `@cap-collectif/ui` (`checked={value} onChange={() => mutation(...)}`).
  Deux variantes possibles selon la consigne :
  - **Par défaut : toggle uniquement dans la modale d'édition** — la colonne liste affiche juste un statut,
    pas un contrôle interactif — utiliser un `Tag` avec `variantColor="success"` + `global.yes` ("Oui", vert)
    si `true`, `variantColor="infoGray"` + `global.no` ("Non", gris) si `false`, plutôt qu'une checkbox/case
    non cliquable qui induirait en erreur sur l'interactivité. Le `Switch` reste alors uniquement dans la
    modale d'édition. C'est le cas par défaut : sauf consigne explicite contraire, "remplacer un booléen par
    un Switch" veut dire "dans la modale", pas "dans la liste".
  - **Cas marginal : toggle éditable directement dans la liste** (comme `CardFacebook.tsx`) : `Switch` dans
    la colonne, une seule mutation `update` avec tous les champs optionnels sauf l'id (voir point "CRUD
    complet" ci-dessous) permet d'envoyer soit l'objet complet (modale), soit juste `{id, isEnabled}` (Switch
    dans la liste). Voir l'exemple dans
    `admin-next/components/BackOffice/Authentication/SSOList/Facebook/CardFacebook.tsx`. Ne suivre ce pattern
    que si la consigne le demande explicitement (ex. besoin de toggler rapidement plusieurs entités sans
    ouvrir de modale) — ne pas l'utiliser par défaut.
- **CRUD complet (create/edit/delete) dans une seule modale**, comme demandé pour `UserTypesList.tsx` /
  `UserTypeModal.tsx` : un unique composant modale reçoit un prop optionnel (l'entité à éditer, absent =
  mode création) et gère les trois actions. Le bouton "Modifier" (pencil) dans la liste ouvre la modale en
  mode édition ; le bouton "Supprimer" est **dans le footer de cette même modale d'édition**, pas un
  `Popover`/une modale de confirmation séparée (contrairement à
  `Redirection/DeleteRedirectModal.tsx`, qui utilise un `Popover` — ne pas suivre ce pattern-là si la
  consigne demande explicitement des modales pour les 3 actions). Utiliser un état de chargement séparé pour
  le bouton delete (ex. `isDeleting`) plutôt que `formState.isSubmitting` de react-hook-form, qui ne reflète
  que les soumissions passées par `handleSubmit`.
- **Bouton de création au-dessus d'une liste/`Table`** : le laisser aligné à gauche (comportement par défaut d'un `Flex`) et lui donner `variantSize="small"` — c'est la taille
  standard pour ce type de bouton d'action au-dessus d'une liste admin-next, pas `"big"` (réservé aux boutons
  de `Modal.Footer`).
- **Colonne d'action contenant un ou plusieurs boutons dans une `Table`** (ex: `ButtonQuickAction`, `Button`,
  `SettingModal`/`ImageModal`...) : centrer à la fois le libellé de la colonne et son contenu, plutôt que de
  les laisser ferrés à gauche (comportement par défaut) :
  - Sur le `Table.Th` de la colonne : `display="flex" justifyContent="center"`.
  - Sur chaque `Table.Td` de cette colonne : wrapper le(s) bouton(s) dans un `<Flex justifyContent="center">`.
  Voir `ProjectSettingsList.tsx` (colonne "Action" : le `Table.Th` et les deux `Table.Td` concernés, celui de
  `ProjectFeatureRow` et celui de `settings.map(...)`).
- **Accessibilité : intitulé explicite pour les boutons et champs de recherche, jamais un libellé générique
  seul.** Un lecteur d'écran annonce le bouton/champ hors du contexte visuel de la page : "Créer" ou
  "Rechercher" seuls ne disent pas quoi. Toujours préciser l'entité concernée : "Créer le type", "Créer la
  vidéo", "Créer un type de profil" plutôt que "Créer" ; "Rechercher une utilisatrice" plutôt que
  "Rechercher". S'applique au texte visible du bouton/label, et à l'`aria-label` si le bouton n'a qu'une
  icône (ex: `ButtonQuickAction`).
- **Entité à identifiant entier auto-incrémenté (pas d'UUID, ex. `IdTrait`)** : ne pas chercher à l'enregistrer
  dans `GlobalIdResolver::AVAILABLE_TYPES` ni à implémenter l'interface `Node`/`Relay::GlobalId` — exposer
  simplement `id: type: 'ID!'` (l'entier brut) et résoudre les mutations avec
  `$repository->find($args->offsetGet('id'))`. C'est le pattern déjà utilisé par `ProjectType`
  (`UpdateProjectTypeMutation`) ; `Node`/`GlobalId` est réservé aux entités UUID (`HttpRedirect`, `UserType`,
  `GlobalDistrict`...).
- **Liste avec CRUD complet mais peu volumineuse** (pas besoin de scroll infini) : l'exposer quand même comme
  une **Relay connection** (`argsBuilder: 'Relay::ForwardConnection'` côté yaml + `Paginator::auto($args,
  $totalCount)` côté resolver PHP, voir `HttpRedirectListResolver`/`QueryGlobalDistrictResolver`) plutôt
  qu'une simple liste `[X!]!`. Ça permet d'utiliser côté client les directives Relay `@prependNode(connections:
  ..., edgeTypeName: "XEdge")` (create) et `@deleteEdge(connections: ...)` (delete) directement dans le texte
  de la mutation GraphQL, sans écrire de fonction `updater` manuelle avec `ConnectionHandler` — voir
  `CreateUserTypeMutation.ts`/`DeleteUserTypeMutation.ts` pour l'exemple le plus simple.
- **Catégorie `SiteParameter` de la page générique `/admin/settings/{category}/list`** (voir le cas
  `SettingsController.php` dans la méthodologie ci-dessus) : toujours vérifier `SiteParameter::isTranslatable()`
  (la constante `NOT_TRANSLATABLE` liste les exceptions par `keyname`) avant de choisir le template, les deux
  cas ayant une forme très différente bien que la table Sonata source soit la même :
  - **Non traduisible** (ex: `settings.notifications` — adresses email, nom d'expéditeur) :
    `NotificationSettingsList.tsx` / `NotificationSettingModal.tsx` — `Table` + modale avec un simple
    `FieldInput type="text"` pour `value`, pas de sélecteur de langue. Query `notificationSettings: [SiteParameter!]!`
    ne charge pas `translations`.
  - **Traduisible** (ex: `pages.login`, `pages.blog`, `pages.events`, `pages.projects` — textes affichés
    publiquement) : suivre la section « Recette : catégorie `SiteParameter` traduisible (multilangue) »
    ci-dessous, autonome et à appliquer telle quelle. Elle couvre aussi les catégories qui mélangent des
    `keyname` traduisibles et non traduisibles dans une même liste (ex: `pages.events` avec `event.customcode`),
    ainsi que la validation par langue, l'invalidation du cache et la vérification côté site public.
  - **Snapshots e2e GraphQL, Cypress et dump `var/db.backup`** : `jest-setup-global.e2e.js` (tests e2e
    GraphQL) et le hook `before:run` de `cypress/plugins/index.ts` commencent par `fab local.qa.save-db`,
    c'est-à-dire qu'ils **écrasent le dump avec l'état courant de la base locale**, puis `_setupDB.js` /
    `cy.task('db:restore')` restaurent ce dump. Si la base locale a été modifiée à la main (traductions ajoutées
    depuis l'UI pendant des tests manuels) ou par un run Cypress précédent (un spec qui enregistre des données
    laisse la base dans cet état à la fin), les snapshots générés avec `-u` embarquent ces données et ne
    correspondent plus aux fixtures, et un spec Cypress qui suppose l'état des fixtures échoue dès son premier
    `should` — le symptôme est un snapshot ou un test qui change alors que le code testé n'a pas bougé. Avant de
    (re)générer des snapshots ou d'enchaîner des runs Cypress : `pipenv run fab local.database.generate` pour
    repartir des fixtures. Le champ `translations` est renvoyé dans l'ordre de la base, non déterministe pour
    des lignes fraîchement insérées : trier par `locale` dans le test avant `toMatchSnapshot()`.
  - **Cypress en local sur une page admin-next protégée par un feature flag** : `withFeatureFlagRequired` lit
    les flags dans Redis côté Next.js avec le préfixe `SYMFONY_REDIS_PREFIX` du conteneur `capco_nextjs_1`
    (`dev`), alors que `cy.task('enable:feature', ...)` active le flag de l'environnement **test** (namespace
    `testfeature_toggle`, voir `config/packages/test/quandidate_toggle.yaml`). En local, la redirection SSR
    dépend donc du flag **dev** (`bin/console capco:toggle:enable <flag>` sans `--env`), et le test « redirige
    vers Sonata quand la migration est désactivée » ne peut pas passer tant que le flag dev est actif — en CI
    les deux préfixes coïncident et le spec complet passe. Le run Cypress refuse aussi de démarrer depuis un
    terminal VS Code si `ELECTRON_RUN_AS_NODE=1` est hérité (`bad option: --no-sandbox`) : lancer
    `env -u ELECTRON_RUN_AS_NODE yarn cy:run ...`.

## Recette : catégorie `SiteParameter` traduisible (multilangue)

S'applique à toute catégorie de `/admin/settings/{category}/list` contenant au moins un `keyname` traduisible
(`SiteParameter::isTranslatable()`, c'est-à-dire absent de `SiteParameter::NOT_TRANSLATABLE`), y compris quand
la liste mélange des `keyname` traduisibles et non traduisibles (ex: `pages.events` avec `event.customcode`).
Référence canonique, à reproduire en remplaçant `Event`/`event`/`pages.events` par la feature migrée :
`admin-next/components/BackOffice/EventSettings/EventSettingsList.tsx`,
`src/Capco/AppBundle/GraphQL/Resolver/EventSettings/EventSettingsQueryResolver.php`,
`src/Capco/AppBundle/GraphQL/Mutation/EventSettings/UpdateEventSettingMutation.php` et
`src/Capco/AppBundle/Resources/config/graphql/internal/EventSettings/`. Les autres pages traduisibles déjà
migrées (`BlogSettingsList.tsx`, `ProjectSettingsList.tsx`) sont des variantes antérieures : ne pas les copier
pour la gestion des langues (voir « Pourquoi » en fin de section). La recette est autonome : elle suffit même si
les fichiers de référence ne sont pas sur la branche courante.

### 1. Comportement attendu

| Situation | Liste (colonne « Valeur ») | Modale d'édition | Sauvegarde |
|---|---|---|---|
| `multilangue` actif, paramètre traduisible | valeur dans la langue de l'interface admin (`intl.locale`), repli sur la langue par défaut de la plateforme si cette langue n'est pas disponible | sélecteur de langue ouvert sur la langue de l'interface ; changer de langue conserve ce qui a été saisi dans les autres ; champ vide pour une langue sans traduction (pas de repli) | une seule mutation avec toutes les langues modifiées ; une valeur vide supprime la traduction de cette langue ; les langues non envoyées sont intouchées |
| `multilangue` inactif, paramètre traduisible | toujours la langue par défaut de la plateforme, même si le cookie `locale` de l'admin dit autre chose | pas de sélecteur, seule la langue par défaut est éditable | le back stocke sous la langue par défaut quelle que soit la locale reçue |
| paramètre non traduisible (ex: `event.customcode`) | colonne `value` | pas de sélecteur | une seule valeur, stockée dans la colonne `value` de `site_parameter` |
| tous les cas | `isEnabled` en `Tag` Oui/Non | `Switch` « Publié », commun à toutes les langues | `isEnabled` enregistré même si aucune valeur n'a changé |

Validation côté back, pour **chaque** valeur reçue : `TYPE_INTEGER` → entier strictement positif ;
`isSocialNetworkDescription()` → 160 caractères maximum (limite de la contrainte `LessThanIfMetaDescription`).
Erreur → `errorCode` dans le payload, `mutationErrorToast` côté front. Après sauvegarde, la nouvelle valeur doit
apparaître sur le site public dans la langue éditée (cache invalidé, voir 2d).

Pour mémoire, Sonata éditait une seule langue à la fois via un rechargement `?tl=<locale>`
(`TranslatableAdminExtension` posait `setCurrentLocale()` sur l'entité), champ vide pour une langue sans
traduction, sans repli sur la langue par défaut.

### 2. Backend

Fichiers à créer :

```
src/Capco/AppBundle/GraphQL/Resolver/EventSettings/EventSettingsQueryResolver.php
src/Capco/AppBundle/GraphQL/Resolver/EventSettings/EventSettingsImageQueryResolver.php   # si la catégorie a des SiteImage
src/Capco/AppBundle/GraphQL/Mutation/EventSettings/UpdateEventSettingMutation.php
src/Capco/AppBundle/GraphQL/Mutation/EventSettings/UpdateEventImageMutation.php          # idem
src/Capco/AppBundle/Resources/config/graphql/internal/EventSettings/enum/UpdateEventSettingErrorCode.types.yaml
src/Capco/AppBundle/Resources/config/graphql/internal/EventSettings/input-object/UpdateEventSettingTranslationInput.types.yaml
src/Capco/AppBundle/Resources/config/graphql/internal/EventSettings/mutations/UpdateEventSettingInput.types.yaml
src/Capco/AppBundle/Resources/config/graphql/internal/EventSettings/mutations/UpdateEventSettingPayload.types.yaml
```
plus une entrée `eventSettings` dans `InternalQuery.types.yaml` et `updateEventSetting` dans
`InternalMutation.types.yaml`.

**2a. Query.** Le type GraphQL `SiteParameter` existe déjà (`id`, `keyname`, `value`, `isEnabled`, `type`,
`isTranslatable`, `translations { locale value }`) : ne rien y ajouter. Le resolver recharge explicitement
toutes les traductions, sinon la collection `translations` de l'entité peut n'en contenir qu'une (voir
« Pourquoi »). Exclure les `keyname` que Sonata excluait déjà (`SettingsController::EXCLUDED_SETTINGS_KEYNAME`,
ex: `events.map.country`).

```php
public function __invoke(): array
{
    $parameters = $this->repository->findBy(['category' => 'pages.events'], ['position' => 'ASC']);
    $translationRepository = $this->entityManager->getRepository(SiteParameterTranslation::class);

    foreach ($parameters as $parameter) {
        if (!$parameter->isTranslatable()) {
            continue;
        }
        // Complete the (possibly partial) translations collection with every stored translation.
        foreach ($translationRepository->findBy(['translatable' => $parameter]) as $translation) {
            $parameter->addTranslation($translation);
        }
    }

    return $parameters;
}
```

```yaml
# InternalQuery.types.yaml — reprendre la condition de FeaturesCategoryResolver::$categories[<category>]['conditions']
eventSettings:
    type: '[SiteParameter!]!'
    access: "@=hasRole('ROLE_ADMIN') and hasFeatureFlag('calendar')"
    resolve: '@=query("Capco\\AppBundle\\GraphQL\\Resolver\\EventSettings\\EventSettingsQueryResolver")'
```

**2b. Mutation — types.**

```yaml
# input-object/UpdateEventSettingTranslationInput.types.yaml
UpdateEventSettingTranslationInput:
    type: input-object
    config:
        fields:
            locale:
                type: 'TranslationLocale!'   # enum existante ; côté PHP la valeur arrive déjà au format 'fr-FR'
            value:
                type: 'String!'              # vide = suppression de la traduction de cette langue

# mutations/UpdateEventSettingInput.types.yaml
UpdateEventSettingInput:
    type: relay-mutation-input
    config:
        fields:
            id:
                type: 'ID!'                  # uuid brut de SiteParameter, pas de global id
            translations:
                type: '[UpdateEventSettingTranslationInput!]!'   # langues absentes = intouchées ; [] autorisé
            isEnabled:
                type: 'Boolean!'

# mutations/UpdateEventSettingPayload.types.yaml
UpdateEventSettingPayload:
    type: relay-mutation-payload
    config:
        fields:
            siteParameter:
                type: 'SiteParameter'
            errorCode:
                type: 'UpdateEventSettingErrorCode'

# enum/UpdateEventSettingErrorCode.types.yaml : EVENT_PARAMETER_NOT_FOUND et EVENT_PARAMETER_INVALID_VALUE,
# valeurs en `!php/const` sur les constantes de la mutation.

# InternalMutation.types.yaml
updateEventSetting:
    access: "@=hasRole('ROLE_ADMIN') and hasFeatureFlag('calendar')"
    builder: 'Relay::Mutation'
    builderConfig:
        inputType: UpdateEventSettingInput
        payloadType: UpdateEventSettingPayload
        mutateAndGetPayload: '@=mutation("Capco\\AppBundle\\GraphQL\\Mutation\\EventSettings\\UpdateEventSettingMutation", args)'
```

**2c. Mutation — PHP.** Dépendances : `SiteParameterRepository`, `LocaleRepository`, `EntityManagerInterface`,
`UpdateSiteParameterMutation` (pour `invalidateCache()`), `Capco\AppBundle\Toggle\Manager`. Reproduire cette
structure telle quelle :

```php
public function __invoke(Argument $input): array
{
    $this->formatInput($input);

    try {
        // find($id) + check of the category, otherwise UserError(EVENT_PARAMETER_NOT_FOUND)
        $siteParameter = $this->getSiteParameter($input);
        $valuesByLocale = $this->resolveValuesByLocale(
            $siteParameter,
            (array) ($input->offsetGet('translations') ?? [])
        );
        foreach ($valuesByLocale as $value) {
            self::checkValue($siteParameter, $value);
        }

        $siteParameter->setIsEnabled((bool) $input->offsetGet('isEnabled'));
        foreach ($valuesByLocale as $locale => $value) {
            $this->updateValue($siteParameter, $value, $locale);
        }
        $this->entityManager->flush();
        // Discard a possibly partial `translations` collection so the payload exposes every translation.
        $this->entityManager->refresh($siteParameter);
    } catch (UserError $error) {
        return ['errorCode' => $error->getMessage()];
    }

    // Always pass the edited locale: the default is the admin's request locale, not the edited one.
    foreach (array_keys($valuesByLocale) as $locale) {
        $this->updateSiteParameterMutation->invalidateCache($siteParameter, $locale);
    }

    return ['siteParameter' => $siteParameter];
}

/**
 * @return array<string, string> the values indexed by locale
 */
private function resolveValuesByLocale(SiteParameter $siteParameter, array $translations): array
{
    $valuesByLocale = [];
    foreach ($translations as $translation) {
        $valuesByLocale[(string) $translation['locale']] = (string) $translation['value'];
    }
    if ([] === $valuesByLocale) {
        return [];
    }
    if ($siteParameter->isTranslatable() && $this->toggleManager->isActive(Manager::multilangue)) {
        return $valuesByLocale;
    }
    // Non-translatable setting, or multilangue disabled: a single value, stored under the default locale.
    $defaultLocale = $this->localeRepository->getDefaultCode();

    return [$defaultLocale => $valuesByLocale[$defaultLocale] ?? array_values($valuesByLocale)[0]];
}

private static function checkValue(SiteParameter $siteParameter, string $value): void
{
    if (SiteParameter::TYPE_INTEGER === (int) $siteParameter->getType() && (!ctype_digit($value) || (int) $value <= 0)) {
        throw new UserError(self::EVENT_PARAMETER_INVALID_VALUE);
    }
    // Same limit as the LessThanIfMetaDescription constraint on SiteParameter
    if ($siteParameter->isSocialNetworkDescription() && mb_strlen($value) > 160) {
        throw new UserError(self::EVENT_PARAMETER_INVALID_VALUE);
    }
}

// Query SiteParameterTranslation directly: never `SiteParameter::setValue($value, $locale)` + `mergeNewTranslations()`.
private function updateValue(SiteParameter $siteParameter, string $value, string $locale): void
{
    if (!$siteParameter->isTranslatable()) {
        $siteParameter->setValue($value);

        return;
    }

    $translation = $this->entityManager
        ->getRepository(SiteParameterTranslation::class)
        ->findOneBy(['translatable' => $siteParameter, 'locale' => $locale]);

    if ('' === trim($value)) {
        // An emptied value removes the translation, as `mergeNewTranslations()` does
        if ($translation) {
            $this->entityManager->remove($translation);
        }

        return;
    }
    if ($translation) {
        $translation->setValue($value);

        return;
    }

    $this->entityManager->persist(
        (new SiteParameterTranslation())->setTranslatable($siteParameter)->setLocale($locale)->setValue($value)
    );
}
```

Ne pas passer par `$validator->validate($siteParameter)` : la contrainte `LessThanIfMetaDescription` ne lit
que `getValue()` (locale courante de l'entité), donc ni les autres langues reçues, ni rien du tout quand les
traductions sont persistées via le repository.

**2d. Cache.** `SiteParameterCacheSubscriber` (subscriber Doctrine `postFlush`, enregistré dans
`config/packages/services.yaml`) invalide déjà, après le `flush()`, la locale de chaque
`SiteParameterTranslation` persistée/modifiée/supprimée, et **toutes** les locales publiées quand l'entité
`SiteParameter` elle-même change (`isEnabled`, `value` d'un non traduisible). L'appel explicite
`invalidateCache($siteParameter, $locale)` par locale reçue est conservé par cohérence avec les autres
mutations ; ne **jamais** l'appeler sans `$locale` (voir « Pourquoi »).

**2e. Compiler et vérifier** (dans `capco_application_1`) : `bin/console graphql:compile`, puis
`bin/console graphql:dump-schema --schema=internal --format=graphql --file=schema.internal.graphql --with-descriptions`
(étape 10 de la méthodologie), puis `bin/phpstan analyse <dossiers créés>`.

**2f. Test unitaire** : `tests/GraphQL/Mutation/UpdateEventSettingMutationTest.php` sur le modèle de
`tests/GraphQL/Mutation/UpdateProjectSettingMutationTest.php` (mocks, sans base). Cas à couvrir : `multilangue`
inactif → valeur stockée sous la langue par défaut ; paramètre non traduisible → `setValue()` sans traduction ;
valeur vide → `remove()` de la traduction ; meta description > 160 → `errorCode`, aucun `flush()` ;
`translations: []` → `isEnabled` enregistré, aucune invalidation explicite.

### 3. Frontend (`admin-next/`)

Fichiers : `pages/admin-next/event-settings.tsx` (squelette standard `Layout` + `Suspense` +
`withPageAuthRequired`), `mutations/UpdateEventSettingMutation.ts`,
`components/BackOffice/EventSettings/EventSettingsList.tsx`. Puis `yarn relay` dans `admin-next/`, `yarn ts`,
`yarn lint`.

**3a. Query et mutation.**

```graphql
query EventSettingsListQuery {
  eventSettings { id keyname value isEnabled type isTranslatable translations { locale value } }
  availableLocales(includeDisabled: false) { code isDefault traductionKey }
}

mutation UpdateEventSettingMutation($input: UpdateEventSettingInput!) {
  updateEventSetting(input: $input) {
    siteParameter { id value isEnabled translations { locale value } }   # Relay met à jour la ligne de la liste
    errorCode
  }
}
```

Formats de locale : `availableLocales.code` et l'enum `TranslationLocale` valent `FR_FR` ; `translations.locale`
et `intl.locale` valent `fr-FR`. Conversion avec `formatCodeToLocale()` de `@utils/locale-helper`. Ne jamais
utiliser `siteParameter.value` pour pré-remplir une langue (résolu sur la locale de la requête de l'admin, pas
sur la langue par défaut) : la valeur d'une langue est `translations.find(t => t.locale === locale)?.value ?? ''`.

**3b. Helpers.**

```ts
const getSettingValue = (setting: SiteParameter, locale: string) =>
  setting.isTranslatable
    ? setting.translations?.find(translation => translation.locale === locale)?.value ?? ''
    : setting.value ?? ''

// Without the multilangue feature only the platform default locale is editable, whatever the admin's
// locale cookie says (the back-end stores the value under the default locale in that case)
const getDisplayedLocale = (availableLocales: ReadonlyArray<Locale>, viewerLocale: string, multilangue: boolean): Locale => {
  const defaultLocale = availableLocales.find(locale => locale.isDefault) ?? availableLocales[0]
  if (!multilangue) return defaultLocale
  return availableLocales.find(locale => formatCodeToLocale(locale.code) === viewerLocale) ?? defaultLocale
}
```

Liste : `multilangue = useFeatureFlag('multilangue')`, colonne « Valeur » =
`getSettingValue(setting, formatCodeToLocale(getDisplayedLocale(availableLocales, intl.locale, multilangue).code))`.

**3c. Modale et formulaire.** Le formulaire est un composant rendu **dans** le render-prop
`{({ hide }) => ...}` de `Modal` : CapUI démonte son contenu à la fermeture, donc `useForm` repart des
dernières valeurs sauvegardées à chaque ouverture, sans `reset()` à gérer. `Modal` avec
`forceModalDialogToFalse` **et** `hideOnClickOutside={false}` (Jodit rend ses popups hors du dialogue).

```tsx
type SettingFormValues = { isEnabled: boolean } & Record<string, string | boolean>

const EventSettingForm = ({ siteParameter, availableLocales, hide }: SettingFormProps) => {
  const intl = useIntl()
  const formId = React.useId()
  const multilangue = useFeatureFlag('multilangue')
  const defaultLocaleCode = formatCodeToLocale(
    (availableLocales.find(locale => locale.isDefault) ?? availableLocales[0]).code,
  )
  const [currentLocale, setCurrentLocale] = React.useState<TranslationLocale>(
    getDisplayedLocale(availableLocales, intl.locale, multilangue).code,
  )
  const getFieldName = (code: TranslationLocale) => `${code}-value` // DOM id: "FR_FR-value"
  // One field per locale, all loaded at mount, so switching language only changes which field is displayed
  const defaultValues = React.useMemo(() => {
    const values: SettingFormValues = { isEnabled: siteParameter.isEnabled }
    availableLocales.forEach(({ code }) => {
      values[getFieldName(code)] = getSettingValue(siteParameter, formatCodeToLocale(code))
    })
    return values
  }, [siteParameter, availableLocales])
  const form = useForm<SettingFormValues>({ defaultValues })
  const { control, handleSubmit, formState } = form
  const inputType = siteParameter.type === 2 ? 'number' : siteParameter.type === 3 ? 'textarea' : 'text'
  const fieldName = getFieldName(currentLocale)

  // Only the locales whose value changed are sent (dirtyFields is not reliable: TextEditor calls
  // setValue() without shouldDirty). A non-translatable setting has a single value.
  const getTranslationsToSave = (values: SettingFormValues) => {
    const codes = siteParameter.isTranslatable ? availableLocales.map(({ code }) => code) : [currentLocale]
    return codes
      .filter(code => {
        const initialValue = String(defaultValues[getFieldName(code)] ?? '')
        const newValue = String(values[getFieldName(code)] ?? '')
        if (newValue === initialValue) return false
        // Rich text editors normalize an empty content to markup like "<p><br></p>"
        return !(isWYSIWYGContentEmpty(initialValue) && isWYSIWYGContentEmpty(newValue))
      })
      .map(code => ({ locale: code, value: String(values[getFieldName(code)] ?? '') }))
  }

  const onSubmit = async (values: SettingFormValues) => {
    try {
      const response = await UpdateEventSettingMutation.commit({
        input: { id: siteParameter.id, translations: getTranslationsToSave(values), isEnabled: Boolean(values.isEnabled) },
      })
      if (response.updateEventSetting.errorCode) return mutationErrorToast(intl)
      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
      hide()
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <FormProvider {...form}> {/* required by TextEditor (useFormContext) */}
      <Modal.Body direction="column">
        <Flex as="form" id={formId} direction="column" onSubmit={handleSubmit(onSubmit)}>
          {siteParameter.isTranslatable && multilangue && (
            <Box width="180px" mb={4}>
              {/* `Select` from '@cap-collectif/form', driven by hand, outside react-hook-form */}
              <Select
                options={availableLocales.map(locale => ({
                  label: intl.formatMessage({ id: locale.traductionKey }),
                  value: locale.code,
                }))}
                value={currentLocale}
                onChange={value => {
                  const locale = availableLocales.find(({ code }) => code === value)
                  if (locale) setCurrentLocale(locale.code)
                }}
              />
            </Box>
          )}
          {/* The key remounts the editor on locale change: Jodit only re-renders on selectedLanguage change */}
          <FormControl name={fieldName} control={control} key={fieldName}>
            {siteParameter.type === 1 ? (
              <TextEditor
                label={intl.formatMessage({ id: 'global.value' })}
                name={fieldName}
                noModalAdvancedEditor
                platformLanguage={defaultLocaleCode}
                selectedLanguage={defaultLocaleCode}
              />
            ) : (
              <>
                <FormLabel htmlFor={fieldName} label={intl.formatMessage({ id: 'global.value' })} />
                <FieldInput id={fieldName} name={fieldName} control={control} type={inputType} />
              </>
            )}
          </FormControl>
          <FormControl name="isEnabled" control={control}>
            <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
            <FieldInput id="isEnabled" name="isEnabled" control={control} type="switch" />
          </FormControl>
        </Flex>
      </Modal.Body>
      <Modal.Footer>
        <ButtonGroup>
          <Button variant="secondary" variantColor="hierarchy" onClick={hide}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button type="submit" form={formId} isLoading={formState.isSubmitting}>
            {intl.formatMessage({ id: 'global.save' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </FormProvider>
  )
}
```

Points non négociables de ce bloc : `selectedLanguage` et `platformLanguage` restent fixés sur la langue par
défaut (le `key` suffit à remonter l'éditeur) ; `TextEditor` (pas `Jodit` directement) avec
`noModalAdvancedEditor` pour `TYPE_RICH_TEXT` ; sélecteur = `Select` de `@cap-collectif/form`, pas
`FieldInput type="select"` (warning « Function components cannot be given refs ») ni `Menu` (Ariakit, peu
fiable dans une modale) ; `isWYSIWYGContentEmpty` vient de `@shared/utils/isWYSIWYGContentEmpty`.

### 4. Tests Cypress

`cypress/e2e/backOffice/<feature>Settings/<feature>Settings.cy.ts`, `cy.task('db:restore')` en `beforeEach`.
Le champ a pour id `<TranslationLocale>-value` (`FR_FR-value`, `EN_GB-value`…) : cibler
`cy.get('[id$="-value"]').filter(':visible')`, jamais `#value`. Si un scénario doit exercer le sélecteur de
langue : `cy.task('enable:feature', 'multilangue')` avant `cy.visit()` (cf. `event/eventAdminPage.cy.ts`).
Scénarios suffisants : édition d'un paramètre simple puis vérification de la ligne ; `errorCode` sur une meta
description > 160 (`cy.interceptGraphQLOperation` + `its('response.body.data.updateEventSetting.errorCode')`).

### 5. Vérification manuelle avant de rendre la main

1. `multilangue` actif : changer la langue de l'interface (NavBar) → la colonne « Valeur » suit ; ouvrir la
   modale → sélecteur sur cette langue ; saisir dans deux langues, passer de l'une à l'autre, enregistrer → les
   deux sont en base (champ `translations` de la query) et visibles sur le site public dans chaque langue.
2. `multilangue` inactif (`capco:toggle:disable multilangue`) : pas de sélecteur ; la valeur affichée et
   enregistrée est celle de la langue par défaut, même avec un cookie `locale` d'une autre langue.
3. Paramètre non traduisible : pas de sélecteur, valeur en colonne `value`.
4. `Switch` « Publié » seul, sans changer la valeur → enregistré.
5. Site public : `curl` **sans session** avec un header `Accept-Language` bien formé
   (`Accept-Language: en-US,en;q=0.9`, pas juste `en-GB`). Le champ `value` de `SiteParameter` n'a pas
   d'argument `locale` : il est résolu (`GraphQLLocaleResolver`/`RequestLocaleResolver`) depuis `_locale`, le
   préfixe d'URL, le cookie `locale`, la session puis `Accept-Language` — une session déjà ouverte fausse le
   test, un `curl -b "locale=en-GB"` aussi.
6. Avant de (re)générer des snapshots ou d'enchaîner des runs Cypress : piège « Snapshots e2e GraphQL, Cypress
   et dump `var/db.backup` » ci-dessus.

### 6. Pourquoi (à lire avant de dévier de la recette)

- **Collection `translations` partielle.** `SiteParameterResolver` (appelé à chaque requête par
  `LocaleSubscriber`) exécute, quand son cache `site_parameters_<locale>` est froid,
  `SiteParameterRepository::getValues($locale)` : un fetch-join des traductions filtré sur la locale courante
  (`leftJoin('p.translations', 't', WITH 't.locale = :locale')` + `select('p', 't')`). Doctrine hydrate alors
  tous les `SiteParameter` de l'identity map avec une collection `translations` initialisée mais partielle (la
  seule traduction de la locale courante, ou vide). `$repository->find($id)` renvoie cette instance :
  `setValue($value, $locale)`/`translate()` ne trouve pas la traduction d'une autre locale, en crée une,
  `mergeNewTranslations()` l'ajoute et le `flush()` viole la contrainte unique (`translatable_id`, `locale`).
  Comme ça ne se produit qu'avec un cache froid, le bug est intermittent et invisible au premier essai. D'où :
  lecture par `addTranslation()` de chaque ligne du repository (2a), écriture via le repository
  `SiteParameterTranslation` (2c), `refresh()` après `flush()` pour que le payload expose toutes les
  traductions au lieu d'une collection partielle (`[]` si la locale courante n'a pas de traduction).
- **`SiteParameter.value` GraphQL** est `getValue()` sans locale, donc `translate($currentLocale)` avec la
  locale posée au `postLoad` par `TranslatableEventSubscriber` : la valeur dans la langue de l'admin, pas dans
  la langue par défaut.
- **`Jodit.tsx`** mémoïse tout son rendu sur sa seule prop `selectedLanguage` (`useMemo(..., [selectedLanguage])`)
  et la branche `noModalAdvancedEditor` de `TextEditor.tsx` ne la transmet pas : un `reset()` ou un changement
  de `value` n'est jamais répercuté dans l'éditeur, le texte de la langue précédente reste affiché et finit
  enregistré dans la nouvelle langue. Un système de brouillons + `reset()` par langue (variante
  `BlogSettingsList.tsx`) ne règle pas ça et complique la sauvegarde multi-langues ; le `key` sur le
  `FormControl` remonte une instance fraîche dont `value`/`onChange` sont justes dès le premier rendu. Faire
  varier `selectedLanguage` en plus est inutile (et a été corrélé une fois à un test cassé) ; ce n'est pas la
  cause du warning « Maximum update depth exceeded », voir le piège `rowId` plus bas.
- **`invalidateCache()` sans locale** (`UpdateSiteParameterMutation::invalidateCache(SiteParameter, ?string
  $locale = null)`, `SiteParameterRuntime::invalidateCache(string $key, ?string $locale = null)`) retombe sur la
  locale de la requête courante, c'est-à-dire celle de l'admin : correct pour Sonata (l'admin change sa propre
  langue pour éditer chaque traduction) et pour les `keyname` non traduisibles, faux pour une modale qui édite
  une locale arbitraire. Symptôme : mutation en succès, traduction en base, mais le site public ne la montre
  jamais dans cette langue. `SiteParameterCacheSubscriber` couvre désormais ce cas au `postFlush` ; passer quand
  même la locale.
- **`TranslationLocale`** : enum GraphQL sérialisée en `FR_FR`, constante PHP `'fr-FR'`. Côté PHP,
  `$translation['locale']` est déjà `fr-FR` ; côté client (ids de champs, sélecteurs Cypress), c'est `FR_FR`.
- **Une mutation par langue** (variante `ProjectSettingsList.tsx`) n'est pas atomique et multiplie les appels
  et les invalidations ; le tableau `translations` règle ça en un appel, et permet `translations: []` pour un
  changement de `isEnabled` seul.

## Connection ID pour les mutations create/delete (Relay)

Beaucoup de listes Relay paginées ont besoin du `__id` de la connection pour que les mutations `create`/`delete`
mettent à jour le cache local (`connections: [connectionId]` passé à la mutation). Deux cas très différents se
présentent, à ne pas traiter de la même façon :

- **Le composant qui déclenche la mutation vit au même niveau que le composant qui a le fragment de la liste**
  (ex : un bouton "modifier"/"supprimer" rendu à l'intérieur du `.map()` de la liste elle-même, comme dans
  `SourceCategoriesList.tsx`) : la liste a déjà `__id` disponible directement dans les données de son fragment
  (le champ `@connection(key: "...")` expose un champ client `__id`), il suffit de le passer en prop au composant
  enfant. **Pas besoin de `ConnectionHandler` dans ce cas.**
- **Le composant qui déclenche la mutation vit dans un composant parent qui n'a pas le fragment de la liste**
  (ex : un bouton "Ajouter" tout en haut de la page, au-dessus du `<Suspense>` qui contient la liste paginée —
  cas de `SourceCategoryModal context="create"` rendu dans `pages/admin-next/source-categories.tsx`) : **ne
  pas** dupliquer la query parente pour aller chercher `__id`, et surtout **ne pas** créer un `useState` +
  un setter passé en prop à la liste pour "remonter" le `__id` du fragment vers le parent via un `useEffect`: cela crée un état dupliqué
  avec les données Relay, un rendu supplémentaire, et un court instant où la valeur est vide au premier rendu
  — ce qui casse silencieusement le bouton "Ajouter" jusqu'à ce que l'effet se déclenche. À la place, calculer
  l'ID de la connection directement au moment du commit de la mutation avec
  `ConnectionHandler.getConnectionID(parentId, connectionKey, filters)` (import depuis `relay-runtime`) :
  - `parentId` : l'id du noeud parent du champ connection dans le schéma GraphQL. Pour une connection exposée
    directement sur `Query` (comme `sourceCategories`), c'est `ROOT_ID` (également importé de `relay-runtime`) ;
    pour une connection sous un objet (ex: `organization.proposalForms`), c'est l'id de cet objet.
  - `connectionKey` : la valeur du `key:` déclarée dans `@connection(key: "...")` sur le champ, dans le
    fragment de la liste (ex: `"SourceCategoriesList_sourceCategories"`).
  - `filters` : un objet reprenant les arguments de la query autres que la pagination (`first`/`after`/
    `last`/`before`), s'il y en a (recherche, tri, filtres métier...) — objet vide (`{}`) si la connection n'a
    pas d'autre argument. Voir `CreateFormModal.tsx` pour un exemple avec filtres (recherche + tri + type).
  - Ce pattern est déjà utilisé ailleurs dans `admin-next/` : `components/BackOffice/Forms/CreateFormModal.tsx`,
    `components/BackOffice/SecuredParticipation/SectionIdentificationCodes/SectionIdentificationCodes.tsx`,
    `components/BackOffice/Mediator/MediatorVoteModal/MediatorVoteModal.tsx`.

En résumé : si `__id` est déjà dans les données du composant courant, le passer directement en prop ; sinon le
calculer avec `ConnectionHandler.getConnectionID` au point d'usage — jamais via un état React + un setter
prop-drillé entre la liste et un ancêtre.

## Pièges connus

- **Cliquer sur un `Switch` (`@cap-collectif/ui`) dans un test Cypress** : l'`<input type="checkbox">` sous-
  jacent est rendu **visuellement caché** (`width:0, height:0, opacity:0`) — c'est le `<span
  class="cap-switch__slider">` (le rail visible) qui joue le rôle visuel, tous deux enveloppés dans un
  `<label htmlFor={id}>` interne au composant. Faire `cy.get('#monId').click({ force: true })` directement sur
  l'input force un clic sur un élément de taille 0×0, ce qui est sensible au timing (calcul de coordonnées sur
  une bounding box dégénérée) et produit un test **flaky** (a été observé à ~1 échec sur 3, pas un échec
  systématique donc facile à manquer en un seul run). `cy.get('label[for="monId"]').click()` n'est pas non
  plus fiable : si le champ a aussi un `<FormLabel htmlFor="monId">` séparé pour son texte (ex: "Publié" à
  côté du Switch, cf. `FooterSocialNetworkModal.tsx`), il y a **deux** éléments `label[for="monId"]` dans le
  DOM et `cy.click()` échoue ("Your subject contained 2 elements"). Le sélecteur fiable est
  `cy.get('.cap-switch__slider').click()` (sans `force`) : c'est le seul élément à la fois unique, réel
  (taille non nulle) et à l'intérieur du label interne du `Switch`, donc le clic déclenche bien le toggle par
  délégation native du `<label>`.
- **Ne pas copier un `dangerToast`/`successToast` d'un composant de référence sans relire le texte qui va
  avec** : dans `UserTypeModal.tsx`, la suppression utilise `dangerToast` (rouge) mais avec un message
  **rédigé pour la suppression** (ex: "type supprimé"). Si on réutilise `dangerToast` pour la suppression
  tout en gardant un message générique comme `global.changes.saved` ("Modifications enregistrées") pour
  factoriser les clés de traduction entre create/update/delete, le résultat est un toast rouge qui dit
  "Modifications enregistrées" — incohérent visuellement (le rouge fait penser à une erreur). Si le message
  reste générique/neutre, utiliser `successToast` pour les trois actions (create/update/delete) plutôt que
  `dangerToast` ; réserver `dangerToast` aux cas où le texte est explicitement écrit pour une action
  destructive.
- **Clé de traduction du `successToast` après un enregistrement : préférer une clé générique à une clé
  spécifique à la page.** Pour une **mise à jour**, utiliser `admin.update.successful` ("Modifications
  enregistrées") plutôt que de créer une nouvelle clé dédiée (ex: ne pas créer `admin.videos.successfully-
  updated`, rencontré sur la page vidéo). Pour la **création** et la **suppression**, une clé dédiée reste
  acceptable si le contexte le justifie. Dans tous les cas, **vérifier d'abord si une clé déjà existante
  convient** (`grep` dans `translations/fr-FR.json`) avant d'en créer une nouvelle.
- **Champ `position` géré par Gedmo `@Sortable`** (`PositionableTrait`) sur une colonne SQL `NOT NULL` sans
  valeur par défaut : Gedmo ne calcule **pas** automatiquement une position au flush si le champ est laissé à
  `null` par une mutation GraphQL — ça remonte en erreur SQL (`Column 'position' cannot be null`), pas en
  erreur PHP visible à la compilation. Si `position` est optionnel côté input GraphQL (ex: pour permettre un
  ajout "à la fin" sans que le client ait à connaître le max actuel), calculer explicitement un fallback dans
  la mutation `create` (ex: `MAX(position) + 1` via une méthode dédiée du repository) plutôt que de compter
  sur un comportement automatique de Gedmo.
- **Clé de traduction déjà utilisée côté Symfony/Twig (Sonata) mais jamais encore appelée depuis React** :
  même si la clé existe déjà dans `translations/fr-FR.json` (et dans les `.xlf`), vérifier qu'elle apparaît
  bien dans le bundle utilisé par `admin-next` avant de supposer qu'elle s'affichera correctement — dans le
  doute, `grep` la clé dans `translations/fr-FR.json` (le fichier réellement importé par
  `admin-next/utils/withPageAuthRequired.ts` via l'alias `@translations/*`) pour confirmer sa présence.
- **`redirectOnError` (dans `admin-next/utils/withPageAuthRequired.ts`) lève une exception au lieu de
  rediriger tant que `__isDev__` est vrai** — un 500 obtenu en testant manuellement l'accès refusé d'un
  compte non autorisé (page ou garde-fou de rôle ajouté à l'étape 4 de la méthodologie) est le comportement
  **attendu** en environnement dev, pas un bug : seule la prod fait un vrai redirect 302 vers `/`. Ne pas
  perdre de temps à "corriger" ce 500.
- **Vérifier une query/mutation GraphQL directement en `curl`** quand un navigateur ou Cypress n'est pas
  disponible dans l'environnement : se logger via `POST /login_check` avec un body JSON
  `{"username":"...","password":"..."}` (récupère un cookie `PHPSESSID` valide), puis appeler
  `POST https://capco.dev/graphql/internal` avec ce cookie et `{"query": "..."}`. Ça permet de valider un
  vrai comportement bout-en-bout (accès refusé pour un rôle, données réellement persistées/retournées) sans
  dépendre d'un navigateur headless — utile en complément (pas en remplacement) d'un vrai test dans le
  navigateur.
- **Si `cypress run`/`cypress verify` échoue en local avec `bad option: --no-sandbox` (ou tout autre flag)** :
  c'est que la variable d'environnement `ELECTRON_RUN_AS_NODE=1` est positionnée dans le shell — elle force
  tout binaire Electron (donc Cypress) à démarrer en simple process Node au lieu de lancer l'app, et Node
  rejette alors les flags Electron avec ce message. Relancer la commande avec
  `env -u ELECTRON_RUN_AS_NODE npx cypress ...` (ou `unset ELECTRON_RUN_AS_NODE` dans le shell) résout le
  symptôme. Si l'erreur suivante est `Cannot find module 'lazy-ass'` (ou un autre module introuvable) au
  chargement de `cypress/lib/util.js`, il y a en plus un **package `cypress` dupliqué et périmé** dans
  `cypress/node_modules/cypress` (une vieille version, ex. 13.x, qui a survécu à la montée de version alors
  que la racine a bien été mise à jour vers la version courante) — le symlink
  `cypress/node_modules/.bin/cypress` pointe dessus en priorité. Le supprimer
  (`rm -rf cypress/node_modules/cypress`) puis relancer `yarn install` (et `npx cypress install` pour
  télécharger le binaire de la bonne version) répare l'installation. C'est le même genre de dérive de
  `yarn.lock`/hoisting que les correctifs "chore: dedupe yarn.lock" / "fix: add missing lodash range" faits
  après la montée de version de Cypress — probable qu'il y en ait d'autres du même genre si Cypress n'a pas
  été relancé localement depuis cette montée de version.
- **`Jodit`/`TextEditor` (WYSIWYG) rendu à l'intérieur d'un `Modal` (`@cap-collectif/ui`)** : sans
  `hideOnClickOutside={false}` sur ce `Modal`, il se ferme dès qu'un clic est détecté hors de sa propre
  arborescence DOM — un clic dans l'éditeur (sélection de texte, toolbar, popup de lien...) peut être
  interprété comme un clic extérieur selon comment Jodit monte son DOM, ce qui ferme la modale en plein milieu
  de la saisie. `TextEditor.tsx` passe déjà `hideOnClickOutside={false}` (accompagné de
  `forceModalDialogToFalse`) sur son `Modal` interne (l'"éditeur avancé") pour cette raison précise —
  reproduire au moins `hideOnClickOutside={false}` sur tout `Modal` qui contient un `Jodit`/`TextEditor`.
  Repéré en testant `LoginSettingModal.tsx` (refonte de `pages.login`) : cliquer dans le corps de l'éditeur
  pour positionner le curseur fermait la modale.
- **Warning React "Maximum update depth exceeded" sur une liste `Table` (`@cap-collectif/ui`) — la cause
  réelle est le prop `rowId` sur `Table.Tr`, pas `TextEditor`/Jodit.** Une précédente version de cette entrée
  attribuait ce warning à la prop `selectedLanguage` de `TextEditor` variant avec la langue affichée dans une
  modale traduisible — **c'était un mauvais diagnostic, corrigé ici après qu'il se soit avéré que le warning
  persistait malgré ce correctif.** Repéré sur `MemberSettingsList.tsx` (refonte de `pages.members`) : le
  warning apparaît dès le **chargement initial de la page**, avant toute ouverture de modale (confirmé avec un
  navigateur headless réel, `console.error` intercepté juste après le premier rendu, stack pointant dans le
  sous-arbre de `Table`, pas dans `TextEditor`/`Jodit`) — ce qui exclut d'emblée toute cause liée à la modale
  d'édition ou à `selectedLanguage`. Cause isolée par un test A/B en navigateur headless (voir plus bas) :
  retirer `rowId={setting.id}` de `<Table.Tr key={setting.id} rowId={setting.id} ...>` fait disparaître le
  warning intégralement (0 occurrence sur le chargement de la page et sur l'ouverture successive de toutes ses
  modales, y compris celles avec `TextEditor`). `rowId` ne sert qu'à l'affichage d'une checkbox de sélection de
  ligne (`Table.Tr`/`TrCheckbox`, actif seulement si `Table selectable`) et pose un attribut HTML `id` sur le
  `<tr>` : sur une liste non `selectable` (le cas courant des pages de settings), il n'a aucune utilité
  fonctionnelle et peut être retiré sans perte — garder `key={setting.id}` (React) qui, lui, reste nécessaire.
  Le mécanisme interne exact côté `@cap-collectif/ui` (version `6.0.12`) n'a pas pu être isolé en relisant le
  code source non minifié de `Table`/`Tr`/`Tbody`/`Thead`/`Th` (aucun n'a de `useEffect` conditionné sur
  `rowId` dans ce qui est lisible) — seule la reproduction empirique fait foi ici, pas une explication de
  mécanisme. **`ProjectSettingsList.tsx` a le même correctif** (`git show 4c80a8a433 -- '*ProjectSettingsList.tsx'`
  sur la branche `19942-projects-participatifs-sonata-refonte` retire ce même `rowId` de son `Table.Tr`), mais
  le message et les commentaires de ce commit ("fix: infinite rerender + locales management") attribuaient
  tout le mérite du fix au changement `selectedLanguage`/`TextEditor` décrit plus haut — c'est cette
  attribution erronée qui a été recopiée dans une précédente version de cette doc, et qui a fait perdre du
  temps sur `MemberSettingsList.tsx` (le port du seul changement `TextEditor` n'a rien résolu, puisque
  `MemberSettingsList.tsx` avait `rowId` sur son `Table.Tr` **depuis son commit de migration initial**, sans
  aucun `key={locale}`/`selectedLanguage` variable à l'époque — le vrai bug n'avait donc aucun rapport avec la
  traduction). **Sur toute page qui affiche ce warning sur une `Table` non `selectable`, tester en premier le
  retrait de `rowId` sur `Table.Tr` avant toute autre hypothèse** (Jodit, effets locaux du composant de page,
  etc.) : c'est un test d'une ligne, rapide à éliminer ou confirmer.
  - **Méthode pour isoler ce genre de warning avec certitude (A/B empirique, pas déduction sur le code)** :
    piloter un vrai navigateur headless (voir le piège `playwright-core` plus haut) avec
    `page.on('console', msg => ...)` filtré sur `msg.type() === 'error' && msg.text().includes('Maximum update
    depth exceeded')`, se connecter via `context.request.post('/login_check', ...)` (JSON, cf. piège dédié),
    puis un `page.goto()` du **premier** rendu Symfony (`/`, pour peupler la session Redis) suivi du
    `page.goto()` de la page admin-next à tester. Compter les occurrences juste après le chargement (avant
    toute interaction) pour confirmer que le bug est bien un problème de rendu initial et non déclenché par une
    action utilisateur, puis retirer/modifier une seule prop suspecte à la fois entre deux runs (HMR recompile
    en ~2s, vérifiable dans `docker logs capco_nextjs_1`) pour confirmer/infirmer chaque hypothèse — beaucoup
    plus fiable que de déduire la cause depuis un commit de référence dont les commentaires peuvent eux-mêmes
    être un faux diagnostic, comme ici.
- **Pour un sélecteur de langue dans un formulaire, préférer le composant `Select` importé directement depuis
  `@cap-collectif/form`** (piloté en `value`/`onChange` "à la main", hors react-hook-form — voir
  `BlogSettingsList.tsx` sur `19937-posts-sonata-refonte`, ou `LoginSettingModal.tsx`) **plutôt que**
  `FieldInput type="select"` **ou** le composant `Menu` :
  - `Menu` (`@cap-collectif/ui`, pattern utilisé par `Shield.tsx`) repose sur Ariakit (portail + gestion de
    focus dédiée) et s'est avéré peu fiable dans une `Modal` en pratique (voir le piège dédié un peu plus haut).
  - `FieldInput type="select"` wrappe ce même `Select` mais le pilote via `useController`/`ref` — `Select`
    n'étant pas un `React.forwardRef`, ça déclenche un warning React ("Function components cannot be given
    refs") visible dans la console. Ça reste fonctionnel, mais `Select` utilisé directement (comme fait
    `PostFormSide.tsx` avec `currentLocale`, ou `BlogSettingsList.tsx`) l'évite et convient mieux ici puisque
    la langue sélectionnée est un état d'affichage de la modale, pas une donnée du formulaire à soumettre.
  Voir aussi la clé de traduction générique `global-languages` ("Langues") pour le label, plutôt que
  `admin.post.languages` qui est spécifique aux articles de blog.
- **Avant de conclure qu'un correctif ne fonctionne pas suite à un retour utilisateurice pendant un test
  manuel dans le navigateur, vérifier que le serveur `capco_nextjs_1` a bien reconstruit le code modifié —
  ne pas se fier aux seuls logs `[INFO] Compiled ...`.** Sur `LoginSettingModal.tsx` (refonte de `pages.login`),
  plusieurs allers-retours de correctifs (`hideOnClickOutside`, `forceModalDialogToFalse`, puis le remplacement
  de `Menu` par `FieldInput type="select"`) ont chacun été signalés comme "ne fonctionne toujours pas" par
  l'utilisatrice alors que le code sur disque était pourtant correct. Cause réelle : le HMR de Next.js restait
  bloqué sur une build périmée malgré des logs affichant `✓ Compiled /admin-next/login-settings` à chaque
  édition — signe révélateur repéré a posteriori dans les logs (`docker logs capco_nextjs_1`) : des lignes
  répétées `⚠ Fast Refresh had to perform a full reload` et des `GET .../webpack.hot-update.json 404`, qui
  indiquent un état HMR déjà désynchronisé. Un test avec un navigateur headless fraîchement lancé (aucun cache
  navigateur, donc immunisé aux problèmes de cache **côté client**) confirmait pourtant que le DOM réellement
  servi correspondait encore à une **ancienne** version du composant — la build était donc périmée côté
  **serveur**, pas seulement dans le cache du navigateur de l'utilisatrice. Un `docker restart capco_nextjs_1`
  (puis attendre que `https://capco.dev/<route>` réponde à nouveau, voir le piège plus bas sur `502` pendant le
  redémarrage) a résolu le problème : le comportement observé correspondait enfin au code sur disque. **Leçon
  générale** : si un correctif censé être trivial et correct continue d'échouer après plusieurs itérations dans
  la même session de dev, suspecter une build HMR périmée et faire un restart du conteneur Next.js **avant**
  de continuer à chercher une cause applicative plus complexe — ça évite de partir sur de fausses pistes (ici,
  plusieurs hypothèses sur le focus-trap d'Ariakit qui n'ont jamais pu être invalidées correctement tant que le
  test portait sur une ancienne build).
- **Piloter un navigateur headless réel pour diagnostiquer un bug d'interaction UI rapporté par
  l'utilisatrice**, quand l'analyse statique du code ne suffit plus à trancher : `playwright-core` (le paquet
  JS seul, sans télécharger de binaire navigateur) peut piloter le Google Chrome déjà installé sur la machine
  via `chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-certificate-errors'] })` — installer
  avec `npm install playwright-core --no-save` dans un dossier du scratchpad (pas dans le repo). Se logger avec
  `page.request.post('https://capco.dev/login_check', { data: { username, password }, ... })` (même credentials
  de fixture dev que pour `curl`, voir le piège dédié plus haut), puis `page.goto(...)`. Capturer
  `page.on('console', ...)` et `page.on('pageerror', ...)` pour choper les erreurs JS/React réelles (ex: un
  warning React affiché uniquement dans la vraie console du navigateur, invisible autrement), et
  `page.screenshot({ fullPage: true })` pour voir l'état réel rendu. Beaucoup plus fiable qu'un aller-retour de
  correctifs à l'aveugle basés sur la seule lecture du bundle compilé (`ui.cjs.development.js`) quand un
  symptôme resiste à plusieurs hypothèses.
- **Session de dev créée via `curl`/`POST /login_check` non reconnue par `admin-next` (redirection vers `/`
  malgré des identifiants valides)** : `admin-next/utils/session-resolver.ts` va chercher la session dans Redis
  sous une clé préfixée par `getEnv()` (dérivé de `NEXT_PUBLIC_SYMFONY_ENV`), qui doit correspondre à
  l'environnement Symfony ayant réellement créé la session (`SYMFONY_ENV` du conteneur `capco_application_1`,
  généralement `dev` en local). Si `admin-next/.env.local` contient `NEXT_PUBLIC_SYMFONY_ENV=test`, une
  connexion `curl` classique (donc `dev`) ne sera jamais retrouvée par Next.js, qui redirige silencieusement
  vers `/` comme si la session n'existait pas — **ne pas modifier `admin-next/.env.local` pour contourner ça
  sans demander** : demander à la développeuse de
  confirmer/ajuster la variable. Un
  changement de cette variable nécessite un `docker restart capco_nextjs_1` pour être pris en compte (les
  variables `NEXT_PUBLIC_*` sont lues au démarrage du process Next.js).
- **L'énum GraphQL `TranslationLocale` sérialise ses valeurs en SCREAMING_SNAKE_CASE (`FR_FR`, `EN_GB`...),
  pas au format code-langue brut (`fr-FR`, `en-GB`...)** utilisé par l'entité `Locale`/les fixtures/les
  colonnes `locale` en base. Concrètement : une query `availableLocales { code }` renvoie `code: "FR_FR"`
  côté client, **pas** `"fr-FR"`. Piège rencontré sur la page vidéo : un champ de formulaire nommé
  dynamiquement `` `${currentLocale}-title` `` (pattern `MultilangueSidePanel`/`PostFormWrapper`, voir plus
  bas) se retrouve avec l'id réel `FR_FR-title`, pas `fr-FR-title` — un sélecteur Cypress écrit "à
  l'intuition" (`#fr-FR-title`) ne trouve alors **aucun élément visible** de façon peu évidente à déboguer
  (le champ existe bien dans le DOM, juste pas à l'id attendu). Toujours vérifier l'id réel du champ dans le
  DOM (ex: `cy.get('input, textarea, select').then($els => cy.log(...))` pour lister tous les ids présents)
  plutôt que de deviner le format à partir du code des fixtures. Côté backend, ce n'est en général pas un
  problème : le champ GraphQL `locale: TranslationLocale!` reconverti automatiquement la valeur reçue
  (`FR_FR`) vers la constante PHP mappée dans le yaml de l'enum (qui, elle, vaut bien `'fr-FR'`) avant
  d'arriver dans le resolver/la mutation — donc `$translationInput['locale']` côté PHP est déjà au bon
  format `fr-FR`, seul le **client** (id de champ, sélecteurs Cypress) voit la forme `FR_FR`.
- **`translations/` (fr-FR.json, les `.xlf`...) est un dossier entièrement généré et gitignored
  (`translations/*` dans `.gitignore`, seul `translations/routes/` et `translations/README.md` sont
  versionnés) — ne jamais l'éditer à la main pour ajouter une clé.** `translations/README.md` le dit
  explicitement : "This directory is generated do NOT modify — You should run `yarn trad` instead !", et
  `yarn trad` (`fetch-translations` → `fetch_translations.mjs`) va chercher les traductions depuis une
  source externe (plateforme de traduction), pas depuis le repo. Conséquence pour une migration : si de
  nouvelles clés de traduction sont nécessaires (ex: un nouveau message de succès `admin.videos.successfully-
  created`) et qu'aucune clé existante ne convient, un outil IA **ne peut pas** les ajouter lui-même de façon
  durable — les ajouter localement dans `translations/fr-FR.json` permet de tester immédiatement en local
  (le fichier n'étant pas versionné, ça ne casse rien et ne pollue pas la PR), mais il faut explicitement
  prévenir l'utilisateurice que ces clés doivent être ajoutées côté plateforme de traduction externe pour
  survivre à un futur `yarn trad`. Réutiliser une clé déjà existante (`grep` dans `translations/fr-FR.json`
  avant d'en inventer une nouvelle) reste donc préférable à chaque fois que c'est possible.
- **Colonne `NOT NULL` sans défaut sur un champ de traduction optionnel côté GraphQL** (variante du piège
  Gedmo `position` déjà documenté plus haut, mais pour un champ texte) : si une mutation `create`/`update`
  manuelle (sans Symfony Form) construit l'entité de traduction directement (ex: `$translation->setBody($input['body'] ?? null)`)
  et que la colonne SQL correspondante est `NOT NULL` sans valeur par défaut (ex: `body` sur une entité
  utilisant `TextableTrait`, `@ORM\Column(name="body", type="text")` sans `nullable=true`), envoyer `null`
  quand le champ optionnel est vide fait planter le flush avec une `NotNullConstraintViolationException` —
  erreur qui remonte au client GraphQL comme un simple "Internal server Error" générique (catégorie
  `internal`), sans aucun détail exploitable côté frontend/Cypress ; le vrai message SQL n'apparaît que dans
  les logs Symfony (`var/log/{env}.log`, canal `app.CRITICAL`). Toujours vérifier la nullabilité réelle de la
  colonne (pas seulement la nullabilité du champ GraphQL/du type d'input) et défaulter à `''` plutôt qu'à
  `null` pour les colonnes texte `NOT NULL` sans défaut.
- **`cy.task('db:restore')`/`db:save'` (plugin Cypress local) opèrent sur la même base de données locale
  "dev" partagée, pas sur un snapshot isolé par exécution.** Le tout premier `db:save` d'un `cypress run`
  capture l'état **courant** de la base au moment du lancement, et chaque `db:restore` ultérieur (dans
  `beforeEach`) restaure **ce même instantané** — donc si un test précédent (un run cypress antérieur, ou un
  test manuel) a réellement supprimé une ligne de fixture via une mutation `delete`, cette suppression est
  définitive dans la base "dev" locale et se retrouve comme nouvel état de référence dans **tous les runs
  cypress suivants**, y compris pour des tests qui n'ont rien à voir avec la suppression. Symptôme observé :
  un test de suppression passait une fois puis se mettait à échouer de façon apparemment aléatoire sur un
  tout autre test qui `cy.contains()` une ligne de fixture désormais absente. Si des tests Cypress locaux
  échouent de façon incohérente en réutilisant des lignes de fixtures normalement présentes, relancer
  `pipenv run fab local.database.generate` pour repartir d'un état propre avant de chercher un bug côté
  code.
- **`GlobalIdResolver::resolve()` ne sait pas résoudre un id de `Media`** : `Media.id` est exposé **brut** (pas
  de `Relay::GlobalId`, ex: `media4`, ou l'uuid renvoyé par l'uploader), or `resolve()` ne gère que les global
  ids encodés (`User:xxx` en base64) et quelques repositories "legacy" — un id brut de média renvoie donc
  `null` **silencieusement**, ce qui dans une mutation `update` écrase le média existant par `null`. Dans
  une mutation manuelle (sans Symfony Form), résoudre les relations avec le repository concerné après
  `GlobalIdResolver::getDecodedId($id, true)` (qui accepte les deux formes) et un `instanceof`, en levant
  une `UserError` si l'id ne résout pas (cf. `VideoTranslationsTrait::applyAuthorAndMedia`, précédent :
  `HandleProposalFormCategoryImageMutation`). Le pattern Symfony Form (`RelayNodeType`) fait déjà ça pour
  Post/UserType, d'où l'absence du problème sur ces pages.
- **Liste paginée sur une entité traduisible : `leftJoin('x.translations')` + `setMaxResults()` compte des
  lignes SQL, pas des entités.** Dès qu'une entité a plusieurs traductions, chaque page rend moins d'items
  qu'annoncé et un item à cheval sur la limite apparaît sur deux pages — invisible tant que `multilangue`
  est off (une seule traduction par ligne). Utiliser `Doctrine\ORM\Tools\Pagination\Paginator` (comme
  `GlobalDistrictRepository::getWithPagination`) et ajouter un `addOrderBy('x.id')` de départage si le tri
  principal (ex: `position`) peut avoir des égalités, sinon l'ordre entre pages n'est pas stable.
- **Champ numérique optionnel côté UI (`FieldInput type="number"`) vidé par l'utilisateurice avant
  d'enregistrer : vérifier ce que la mutation `update` fait réellement d'un `null` explicite avant de
  laisser le champ non requis.** Rencontré sur le champ `position` de la page vidéo : côté front, un champ
  vidé donne `''` (pas un number), converti en `null` avant l'envoi ; côté mutation PHP,
  `$entity->setPosition((int) ($input->offsetGet('position') ?? $entity->getPosition()))` retombe alors
  silencieusement sur la valeur **déjà en base** au lieu de la réinitialiser — l'utilisateurice vide le
  champ, enregistre, voit le toast de succès, mais la valeur ne change pas (et réapparaît telle quelle au
  rechargement), ce qui donne l'impression que "le champ ne fonctionne pas". Si le champ n'a pas vocation à
  être effacé/optionnel, le rendre requis **avec un vrai schéma yup** (`yup.number().typeError(msg).required(msg)`,
  voir la section "Validation yup" plus haut — `isRequired` sur `FormControl` seul ne suffit pas) plutôt que
  de compter sur le fallback silencieux du backend. Aucun changement backend nécessaire dans ce cas : un
  champ GraphQL `Int` nullable accepte très bien de toujours recevoir un entier non-null envoyé par le
  front.
- **Une vidéo/entité sans aucune traduction peut être créée si la validation ne rejette pas
  `translations: []`** : un `foreach` de validation sur une liste vide retourne vrai par défaut. Exiger au
  moins une traduction (l'UI en envoie toujours une, mais pas l'API).
- **Ne pas vérifier une page `admin-next` en `curl` avec une session obtenue par `POST /login_check`
  seul** : Next.js lit la session dans Redis via `SessionWithJsonHandler`, qui n'est écrite avec le `viewer`
  qu'au premier rendu d'une page PHP — la sonde répond alors `302 /` (« session not found in redis ») même
  si tout va bien. Le curl reste valable pour `POST /graphql/internal` (côté PHP).
- **Si tous les tests Cypress redirigent vers `/` avec « This session key ... could not be found in redis »
  dans les logs de `capco_nextjs_1`** : vérifier en premier `NEXT_PUBLIC_SYMFONY_ENV=test` dans
  `admin-next/.env.local` (précondition d'AGENTS.md). Next recharge ce fichier à chaud (`Reload env`) — le
  recommenter pour tester à la main sur `capco.dev` casse immédiatement Cypress, qui tourne sur `capco.test`.
- **Après un changement de signature d'une méthode publique d'un repository** (ex: `getPaginated(): array`
  → `: Paginator`), le conteneur compilé de l'env `test` garde un proxy lazy avec l'ancienne signature et
  **toute** requête `capco.test` répond 500 (`Compile Error: Declaration of ... must be compatible`) — l'env
  `dev` recompile seul en debug. Vider le cache avec `pipenv run fab local.app.clear-cache --environment=test`
  (qui fait `rm -rf var/cache/test`), **pas** avec `bin/console cache:clear --env=test` via `docker exec`, qui
  reconstruit le conteneur avec les variables d'env du shell et non celles du serveur.
- **Ne jamais passer un fichier `.json` (ex: `SideBarItems.json`) dans la même commande `prettier --write`
  que des fichiers `.ts`/`.tsx`.** Observé sur cette migration : une commande `prettier --write` regroupant
  plusieurs fichiers `.ts(x)` et un `.json` a fait détecter le mauvais parser pour le `.json` (parser
  JS/Babel au lieu de JSON), le réécrivant avec des clés non quotées, des guillemets simples et un `;`
  d'ouverture — un fichier qui n'est alors plus du JSON valide, cassant silencieusement tout ce qui
  l'importe (ex: `import sideBarItems from './SideBarItems.json'`, erreur webpack "Cannot parse JSON" côté
  Next.js). Le run Prettier n'a signalé aucune erreur pour ce fichier (contrairement à un `.json` invalide en
  entrée, où Prettier échoue explicitement) car il s'agit ici d'un JSON *valide en entrée* mal *ré-émis* en
  sortie. Formater les `.json` dans une commande Prettier séparée des `.ts`/`.tsx`, et vérifier le diff (`git
  diff --stat`) d'un fichier de config JSON après un passage Prettier avant de continuer.

## Validation yup : toujours un schéma, et un champ texte requis n'est pas juste `.required()`

- **Ne jamais se contenter du prop `isRequired` de `FormControl` seul** pour valider un formulaire React Hook
  Form, même à un seul champ. `FormControl` et `FieldInput` (`admin-next/shared/cap-collectif/form/src/components/`)
  appellent chacun `useController` séparément pour le même `name`/`control` — `FormControl` enregistre la règle
  `required`, `FieldInput` enregistre `minLength`/`maxLength`/`pattern`. Selon l'ordre de montage des effets,
  l'un peut écraser silencieusement les règles de l'autre, ce qui rend `isRequired` seul non fiable (rencontré
  sur `SourceCategoryModal.tsx` : un titre vide était accepté côté client et provoquait une erreur backend au
  lieu d'un message de validation). Toujours définir un schéma `yup` + `resolver: yupResolver(schema)` sur
  `useForm` — voir le skill `form-mutation`.
- **`.required()` seul n'exclut pas les chaînes composées uniquement d'espaces** (`"   "` passe `.required()`
  car ce n'est pas une chaîne vide). Pour qu'un champ texte considère une valeur "juste des espaces" comme
  vide, utiliser la méthode yup custom réutilisable `notBlank(message)` définie dans
  `admin-next/shared/utils/yupExtensions.ts` (enregistrée via `yup.addMethod(yup.string, 'notBlank', ...)`) à
  la place de `.required()` :
  ```typescript
  import * as yup from 'yup'
  import '@shared/utils/yupExtensions' // charge l'extension yup — sans cet import, .notBlank() n'existe pas au runtime

  const schema = yup.object().shape({
    title: yup.string().notBlank(intl.formatMessage({ id: 'global.required' })),
  })
  ```
  Ce cas (champ texte requis pouvant être rempli avec des espaces) se représente à chaque formulaire de
  création/édition avec un champ titre/nom — utiliser `notBlank` plutôt que de réécrire un `.test(...)` ad hoc
  à chaque fois. Si un nouveau besoin de validation générique apparaît (autre que "pas vide/blanc"), ajouter la
  méthode custom dans ce même fichier `yupExtensions.ts` plutôt que de la dupliquer dans chaque schéma.

## Suivi des migrations

Ce document ne doit **pas** contenir de section de suivi par page migrée (type "ProjectType : fait, voir
détails") — cette information est déjà dans l'historique git (commits, PR) et devient vite obsolète ici.
Seules les informations **génériques**, réutilisables pour n'importe quelle future migration, ont leur place
dans ce fichier.

## Mise à jour de ce fichier

Mettre à jour ce fichier avec tous les apprentissages faits lors des migrations effectuées qui pourront être utiles à d'autres migrations (consignes, common pitfalls, etc.)
