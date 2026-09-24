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
8. **Déployer la refonte derrière un feature flag dédié à la migration — ne pas remplacer définitivement les
   routes Sonata pendant la PR de migration.** Le feature flag fonctionnel existant de la page (ex:
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
14. **Ne pas supprimer le code Sonata dans la PR de migration.** Il doit rester disponible tant que le
    feature flag de migration permet de revenir à la route historique. Le nettoyage des contrôleurs, templates,
    entrées de menu et URLs Sonata intervient dans une PR dédiée, une fois la refonte généralisée et le feature
    flag supprimé pour cette page.
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
  - **Traduisible** (ex: `pages.login` — texte riche affiché publiquement — et `pages.blog`, voir
    `BlogSettingsList.tsx`/`UpdateBlogSettingMutation.php` sur la branche `19937-posts-sonata-refonte`) :
    `LoginSettingsList.tsx` / `LoginSettingModal.tsx` / `LoginSettingForm.tsx` — même structure `Table`/modale,
    mais la query charge aussi `translations { id locale value }` (le resolver doit appeler `addTranslation()`
    pour chaque `SiteParameterTranslation`, comme `SiteParameterQueryResolver::loadTranslations`) et
    `availableLocales(includeDisabled: false) { id code isDefault traductionKey }`. Côté Sonata, le multilangue
    reposait sur un rechargement de la page d'édition avec `?tl=<locale>` (`TranslatableAdminExtension` posait
    `setCurrentLocale()` sur l'entité) : une seule langue éditée à la fois, champ vide pour une langue sans
    traduction (pas de repli sur la langue par défaut). Le comportement à reproduire côté admin-next :
    - **Le formulaire vit dans le corps de la modale** (`LoginSettingForm.tsx` est rendu dans le render-prop
      `{({ hide }) => ...}` de `Modal`) : `Modal` (CapUI) démonte son contenu à la fermeture (`unmountOnHide`),
      donc `useForm` repart des dernières valeurs sauvegardées à chaque ouverture, sans `reset()` à la
      fermeture ni après succès, et sans désynchronisation entre la langue sélectionnée et les valeurs.
    - **Une valeur de formulaire par langue** (`translations: Record<locale, string>`, clés au format `fr-FR`
      de `SiteParameterTranslation.locale`), toutes chargées au montage. Le sélecteur de langue ne fait que
      changer le champ affiché : `<FormControl name={`translations.${locale}`} key={locale}>` — le `key`
      **remonte** le `TextEditor` (pattern `PostForm.tsx`/`UserTypeModal.tsx`). C'est indispensable :
      `Jodit.tsx` mémoïse tout son rendu sur sa seule prop `selectedLanguage` (`useMemo(..., [selectedLanguage])`)
      et la branche `noModalAdvancedEditor` de `TextEditor.tsx` ne la transmet pas, donc un simple `reset()` ou
      changement de `value` n'est **jamais** répercuté dans l'éditeur : le texte de la langue précédente reste
      affiché, et c'est lui qui finit enregistré dans la nouvelle langue. Ne pas contourner avec un système de
      brouillons + `reset()` par langue — les valeurs de toutes les langues vivent déjà dans react-hook-form.
    - Sélecteur de langue, uniquement si le feature flag `multilangue` est actif (sinon seule la langue par
      défaut de la plateforme est éditable, sans sélecteur) : `Select` importé depuis `@cap-collectif/form`
      (piloté à la main en `value`/`onChange` avec des chaînes, HORS react-hook-form), **pas** `FieldInput
      type="select"` (warning React "Function components cannot be given refs", `Select` n'étant pas un
      `forwardRef`) ni `Menu` (voir le piège dédié plus bas).
    - Pour le texte : `TextEditor` (pas `Jodit` directement) avec `noModalAdvancedEditor` si le type Sonata
      d'origine est `SiteParameter::TYPE_RICH_TEXT`. **`selectedLanguage` (et `platformLanguage`) doivent être
      fixés sur la langue par défaut de la plateforme (`defaultLocaleCode`), jamais sur `locale` (la langue
      actuellement affichée dans le sélecteur)** — voir le piège "Maximum update depth exceeded" plus bas : le
      `key={locale}` sur le `FormControl` englobant suffit déjà à faire remonter `TextEditor` quand on change de
      langue, faire varier `selectedLanguage` en plus fait entrer cette prop en conflit avec la mémoïsation
      interne de Jodit et provoque une boucle de rendu infinie. `TextEditor` exige un `FormProvider` ambiant
      (`useFormContext()`). La modale doit garder `forceModalDialogToFalse` **et** `hideOnClickOutside={false}` :
      Jodit rend ses popups (lien, couleur...) hors du dialogue, un dialogue `modal` (focus trap) les rend
      inutilisables et les traite comme un clic extérieur.
    - Ne pas se rabattre sur `siteParameter.value` pour pré-remplir la langue par défaut : ce champ est résolu
      sur la locale de **la requête** (celle de l'admin), pas sur la langue par défaut de la plateforme. La
      valeur d'une langue est `translations.find(t => t.locale === locale)?.value ?? ''`, rien de plus.
    - **Mutation `update*` avec un tableau `translations: [{ locale: TranslationLocale!, value: String! }]`**
      (input-object `UpdateLoginSettingTranslationInput`, enum `TranslationLocale` dont les valeurs PHP sont
      déjà au format `fr-FR`), comme `UpdateUserTypeMutation`/`UpdatePostMutation` : une seule mutation,
      atomique, quel que soit le nombre de langues modifiées. Le front n'envoie que les langues dont la valeur a
      changé (comparaison avec les valeurs initiales — `dirtyFields` n'est pas fiable ici, `TextEditor` appelle
      `setValue()` sans `shouldDirty`) ; le back ne touche qu'aux langues reçues, une valeur vide supprime la
      ligne (même sémantique que `mergeNewTranslations()`), et **si le feature flag `multilangue` est inactif, la
      valeur est stockée sous la langue par défaut de la plateforme** (`LocaleRepository::getDefaultCode()`)
      quelle que soit la locale envoyée. Le cache est invalidé pour chaque locale reçue (voir plus bas).
    - **Persister chaque traduction en interrogeant directement le repository `SiteParameterTranslation`**
      (chercher `{translatable: $siteParameter, locale}`, mettre à jour si trouvé, sinon créer + `persist()`),
      puis **`$em->refresh($siteParameter)` après le `flush()`** avant de renvoyer l'entité dans le payload.
      **Ne pas** utiliser `SiteParameter::setValue($value, $locale)` + `mergeNewTranslations()` (pattern de
      `UpdateBlogSettingMutation.php` sur `19937-posts-sonata-refonte` et de Sonata) : il paraît propre mais
      échoue par intermittence. Cause réelle, vérifiée avec le general log MySQL : `SiteParameterResolver`
      (appelé sur chaque requête par `LocaleSubscriber`/`SiteParameterCacheSubscriber`) exécute, quand son
      cache `site_parameters_<locale>` est froid, `SiteParameterRepository::getValues($locale)` — une requête
      DQL qui **fetch-join les traductions filtrées sur la locale courante** (`leftJoin('p.translations', 't',
      WITH 't.locale = :locale')` + `select('p', 't')`). Doctrine hydrate alors tous les `SiteParameter` dans
      l'identity map avec une collection `translations` **initialisée mais partielle** (la seule traduction de
      la locale courante, ou vide). `$repository->find($id)` dans la mutation renvoie cette même instance :
      `setValue()`/`translate()` ne trouve pas la traduction d'une autre locale, en crée une nouvelle,
      `mergeNewTranslations()` l'ajoute et le `flush()` viole la contrainte unique
      `site_parameter_translation_unique_translation` ; et même avec la requête directe au repository (qui
      persiste correctement), le payload renvoie un `translations` partiel (`[]` si la locale courante n'a pas
      de traduction) tant que l'entité n'est pas rafraîchie. Comme ça ne se produit que si le cache du resolver
      est froid pendant la requête, le bug est intermittent et invisible au premier essai. `refresh()`
      remplace la collection partielle par une collection lazy propre ; `LoginSettingsQueryResolver` (lecture)
      contourne le même problème en appelant `addTranslation()` pour chaque ligne du repository.
  - Dans les deux cas, `isEnabled` reste un champ non traduisible partagé entre toutes les langues — la valeur
    du `Switch`/`Tag` ne dépend donc pas de la langue sélectionnée dans la modale.
  - **Invalidation du cache : passer explicitement la locale éditée, ne pas se fier à la locale de la requête
    courante.** `UpdateSiteParameterMutation::invalidateCache(SiteParameter $siteParameter, ?string $locale =
    null)` (réutilisée par `UpdateNotificationSettingMutation`/`UpdateLoginSettingMutation` via injection) et
    `SiteParameterRuntime::invalidateCache(string $key, ?string $locale = null)` défaut, si `$locale` n'est pas
    fourni, sur `$this->requestStack->getCurrentRequest()->getLocale()` — c'est-à-dire la locale de **l'admin
    qui fait l'appel**, pas celle de la traduction qui vient d'être modifiée. Ce défaut est correct pour
    l'ancien flow Sonata (où l'admin change sa propre langue d'interface pour éditer chaque traduction l'une
    après l'autre) et pour les `keyname` non traduisibles (une seule valeur, peu importe la locale), mais casse
    silencieusement tout endpoint qui permet d'éditer une locale arbitraire indépendamment de la langue de
    session de l'admin (typiquement un sélecteur de langue dans une modale admin-next, comme
    `LoginSettingModal.tsx`) : la traduction est bien persistée en base, mais le cache de la **locale éditée**
    n'est jamais invalidé — seul celui de la locale de l'admin l'est. Symptôme observé : la mutation retourne
    un succès, la traduction est bien en base (vérifiable en SQL), mais **le texte traduit n'apparaît jamais
    sur le frontend public** dans cette langue. Toujours passer `$locale` explicitement (celui reçu dans
    l'input de la mutation) à ces deux méthodes dès que la mutation permet d'éditer une locale différente de
    celle de la requête courante.
  - **Pour vérifier qu'une traduction s'affiche bien côté frontend public**, ne pas tester uniquement via une
    requête GraphQL brute (`curl`) sans contexte de locale réaliste : le champ `value` de `SiteParameter` n'a
    pas d'argument `locale` explicite dans le schéma, il est résolu via `GraphQLLocaleResolver`/
    `RequestLocaleResolver` à partir (dans cet ordre) de l'attribut de route `_locale`, du préfixe d'URL, du
    cookie `locale`, de la session, puis du header `Accept-Language` — un simple `curl -b "locale=en-GB"` sur
    `/graphql/internal` peut donner un résultat différent de ce qu'un vrai navigateur obtiendrait (notamment si
    la session déjà ouverte a persisté une locale différente). Le test le plus fiable et le plus simple à
    scripter est un `curl` **sans session**, avec un header `Accept-Language` correctement formé (ex:
    `Accept-Language: en-US,en;q=0.9`, pas juste `en-GB`) — ça correspond au comportement réel d'un visiteur
    anonyme et évite les effets de bord de session.
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
- **Warning React "Maximum update depth exceeded" en ouvrant/changeant de langue dans la modale d'édition
  d'un `SiteParameter` traduisible de type `TYPE_RICH_TEXT`** : cause réelle, faire varier la prop
  `selectedLanguage` de `TextEditor` avec la langue actuellement affichée (`selectedLanguage={locale}`), en
  plus du `key={locale}` déjà posé sur le `FormControl` englobant pour forcer le remount de l'éditeur au
  changement de langue (voir plus haut, section "traduisible"). Les deux mécanismes se marchent dessus :
  `Jodit.tsx` mémoïse déjà tout son rendu sur sa seule prop `selectedLanguage` (`useMemo(...,
  [selectedLanguage])`), donc à l'intérieur de l'instance fraîchement remontée par le `key`, faire varier
  *aussi* `selectedLanguage` déclenche une boucle de re-render entre cette mémoïsation interne et le cycle de
  render React. Corrigé sur `ProjectSettingsList.tsx`/`MemberSettingsList.tsx` en fixant `selectedLanguage`
  (et `platformLanguage`) sur la langue par défaut de la plateforme (`defaultLocaleCode`), constante quelle
  que soit la langue affichée — le `key={locale}` seul suffit à remonter l'éditeur avec le bon contenu, il n'y
  a besoin d'aucune autre prop variable pour ça. **Ce bug affecte potentiellement toute page migrée avant
  cette découverte qui suit l'ancien pattern documenté** (`selectedLanguage={locale}` variable) : à vérifier
  et corriger de la même façon sur `LoginSettingsList.tsx`/`LoginSettingModal.tsx` (`pages.login`) et
  `BlogSettingsList.tsx` (`pages.blog`, branche `19937-posts-sonata-refonte`) si ce n'est pas déjà fait.
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
