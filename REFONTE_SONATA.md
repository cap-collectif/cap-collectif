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
   - `rolesRequired` dans `SideBarItems.json` **ne sert qu'à l'affichage du menu** (voir
     `SideBar.utils.ts`/`getSideBarItemsFiltered`) — ce n'est **pas** un contrôle d'accès. Une utilisatrice qui
     connaît l'URL directe contourne entièrement ce filtre.
   - L'endroit naturel pour une vraie restriction est le champ GraphQL concerné (`access:` dans les yaml,
     ex: `access: "@=hasRole('ROLE_ADMIN')"` sur une mutation). **Mais avant d'ajouter/modifier un `access:`
     sur une query ou une mutation existante, chercher TOUS ses usages** (`grep` sur `frontend/js/` **et**
     `admin-next/`, pas seulement le nouveau composant qu'on écrit) : certains champs sont volontairement
     partagés avec le front-office public (ex: `projectTypes` alimente aussi le filtre public de la page
     `/projects`, accessible aux visiteurs non connectés) — les restreindre casserait cet usage légitime. En
     général la **mutation** (écriture) peut être restreinte sans risque, alors que la **query** (lecture)
     partagée doit souvent rester ouverte si la donnée est déjà publique ailleurs.
   - Si la query/mutation GraphQL doit rester partagée mais que la **page** admin-next exige un rôle plus
     strict que ce que couvre `withPageAuthRequired`, ajouter un garde-fou au niveau de la page : composer
     `withPageAuthRequired` dans `getServerSideProps` puis vérifier le rôle voulu sur `viewerSession` (ex:
     `viewerSession.isAdmin`), avec redirection manuelle si besoin — attention, `withPageAuthRequired` ne
     retourne pas le format Next.js `{ redirect: {...} }` mais gère la réponse lui-même
     (`res.writeHead(302, { Location: '/' }); res.end(); return { props: {} }`), il faut donc composer en
     conséquence plutôt que retourner un objet `redirect` classique. Voir l'exemple dans
     `pages/admin-next/project-types.tsx`.
5. **Repérer une page `admin-next/` déjà migrée avec une structure similaire** pour copier le pattern plutôt
   que d'en inventer un nouveau. Voir la section "Patterns de référence" ci-dessous pour choisir le bon
   template selon la forme de la donnée (liste plate vs paginée, avec/sans traductions, avec/sans couleur...).
6. **Créer la page** dans `admin-next/pages/admin-next/<nom-en-kebab-case>.tsx` (le nom de fichier = la route).
7. **Créer le(s) composant(s)** dans `admin-next/components/BackOffice/<NomDeLaFeature>/` (PascalCase pour le
   dossier et les fichiers de composants).
8. **Mettre à jour systématiquement l'URL de la page migrée partout où elle apparaît — il existe DEUX menus
   latéraux distincts à maintenir en parallèle tant que la migration n'est pas terminée, plus d'éventuelles
   autres références à traquer au cas par cas** :
   - `admin-next/components/BackOffice/SideBar/SideBarItems.json` : menu latéral utilisé par les pages
     `admin-next/` elles-mêmes (via `Layout.tsx`). Remplacer le `href` Sonata (`/admin/capco/...`) par le
     nouveau `href` Next.js (`/admin-next/...`) pour l'entrée de menu correspondante.
   - `frontend/js/components/Admin/Sidebar/Sidebar.tsx` : menu latéral **legacy**, affiché sur les pages
     encore rendues par Sonata/Twig. Il faut y mettre à jour le `href` du `<SidebarLink>` correspondant de
     la même façon (ex: `<SidebarLink text="admin.label.pages.types" href="/admin-next/project-types" />`).
   - `frontend/js/components/Admin/Sidebar/Sidebar.utils.tsx` (`URL_MAP`) : ce fichier liste, par groupe de
     menu (`projets`, `reglages`, etc.), les préfixes d'URL permettant au menu legacy de savoir quel
     sous-menu ouvrir par défaut selon l'URL courante (`window.location.href.includes(val)`). Remplacer
     l'ancienne entrée Sonata (ex: `/admin/capco/app/projecttype/`) par la nouvelle route `/admin-next/...`
     dans le tableau du bon groupe (sans slash final, comme les autres entrées `/admin-next/...` déjà
     présentes, ex: `/admin-next/geographical-areas`).
   - Ces deux fichiers `Sidebar.tsx`/`Sidebar.utils.tsx` ne pourront être supprimés que lorsque **toutes**
     les pages Sonata auront été migrées (ils sont partagés par toutes les pages Sonata restantes).
   - **Et ailleurs si besoin** : faire une recherche globale de l'ancienne URL Sonata (`grep -rn` sur tout le
     repo) avant de considérer le remplacement terminé. Elle peut aussi apparaître dans des tests (Cypress,
     Behat — voir l'étape dédiée aux tests plus bas), de la documentation, ou d'autres liens internes.
9. **Si de nouvelles mutations/types GraphQL backend ont été ajoutés** (nouveaux fichiers yaml sous
   `src/Capco/AppBundle/Resources/config/graphql/internal/`), il faut, **dans cet ordre**, avant que
   `admin-next` puisse les consommer :
   1. `bin/console graphql:compile` (génère les classes PHP dans `src/Capco/AppBundle/GraphQL/__generated__`
      à partir des yaml — le bundle a `auto_compile: false`, donc cette étape est obligatoire et doit être
      faite **avant** l'étape suivante, sinon le nouveau type/la nouvelle mutation n'apparaît pas).
   2. `bin/console graphql:dump-schema --schema=internal --format=graphql --file=schema.internal.graphql --with-descriptions`
      (regénère `schema.internal.graphql` à la racine, utilisé par le compilateur Relay de `admin-next`).
   3. Un `bin/console cache:clear` peut être nécessaire avant l'étape 1 si le cache Symfony est déjà chaud
      et ne détecte pas les nouveaux fichiers yaml.
10. **Lancer `yarn relay` dans `admin-next/`** après avoir écrit les requêtes/fragments/mutations GraphQL
    (les artefacts générés vivent tous dans `admin-next/__generated__/`, pas de dossier colocalisé).
11. **Vérifier** : `yarn ts` (TypeScript), `yarn lint` (ESLint), et un test visuel réel dans le navigateur
    (le stack Docker local expose `capco_nextjs_1` sur le port 3000, proxifié derrière `https://capco.dev`).
    Si le serveur Next.js dev sert une erreur qui ne correspond plus au code sur disque (ex: référence à un
    import déjà supprimé) après plusieurs éditions rapides, c'est probablement un cache HMR périmé : un
    `docker restart capco_nextjs_1` force une recompilation propre. **Tester avec au moins deux comptes
    de rôles différents** (ex: un admin et un simple project admin) pour vérifier que la restriction d'accès
    de l'étape 4 fonctionne réellement (accès autorisé pour l'un, redirection/refus pour l'autre), pas
    seulement que la page s'affiche.
12. **Tests : Behat → Cypress, et vérification des Cypress existants** :
    - Ne pas chercher à lire / modifier les variables d'environnement, demander à la développeuse aux commandes de modifier les éléments nécessaires.
    - Chercher si des **scénarios Behat** couvrent la page Sonata migrée (dossiers `features/back/...`,
      voir `behat.yml` pour la liste des suites et leurs `paths`). Si oui : **les supprimer** et les
      remplacer par des tests **Cypress** équivalents, rangés dans `cypress/e2e/backOffice/<feature>/`
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
13. **Supprimer le code Sonata de la page migrée dans la même PR**, à condition de vérifier au préalable
    qu'aucun fichier (controller, templates, entité, repository) n'est partagé avec une autre feature encore
    active. Par défaut, préférer supprimer dans la même PR sauf indication contraire de l'auteur de la
    migration — à confirmer au cas par cas.

## Patterns de référence dans `admin-next/`

Selon la forme des données à afficher, s'inspirer du composant le plus proche :

- **Liste plate non paginée avec action d'édition en pencil** (~ce que fait `ProjectType`, `HttpRedirect`) :
  `admin-next/components/BackOffice/Redirection/CustomRedirection.tsx` — `Table` + `Table.Thead`/`Table.Th`
  par colonne + `Table.Tbody`/`Table.Tr`/`Table.Td` + `ButtonQuickAction icon={CapUIIcon.Pencil}` en dernière
  colonne. C'est le pattern utilisé pour `ProjectTypesList.tsx`.
- **Liste de cards à un seul "label"** (ex: `GlobalDistrict`) : `GeographicalAreasList.tsx` — `ListCard` +
  `ListCard.Item` + `ButtonQuickAction` (pencil/trash) dans un `ButtonGroup`.
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

Ce document ne doit **pas** contenir de section de suivi par page migrée (type "ProjectType : fait, voir
détails") — cette information est déjà dans l'historique git (commits, PR) et devient vite obsolète ici.
Seules les informations **génériques**, réutilisables pour n'importe quelle future migration, ont leur place
dans ce fichier.

Mettre à jour ce fichier avec tous les apprentissages faits lors des migrations effectuées qui pourront être utiles à d'autres migrations (consignes, common pitfalls, etc.)