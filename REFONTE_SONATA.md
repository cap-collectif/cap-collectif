Ce document sert à centraliser les informations pour les refontes des pages sonata.
Il a vocation à être complété et utilisé par les outils IA, et doit être supprimé lorsque sonata aura été intégralement supprimé du projet.

Il peut être incrémenté et complété au fil des refontes si nécessaire.
Il sert à lister les étapes / informations nécessaires / utiles à ces refontes.

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
  Voir l'exemple dans `admin-next/components/BackOffice/Authentication/SSOList/Facebook/CardFacebook.tsx`.

Ce document ne doit **pas** contenir de section de suivi par page migrée (type "ProjectType : fait, voir
détails") — cette information est déjà dans l'historique git (commits, PR) et devient vite obsolète ici.
Seules les informations **génériques**, réutilisables pour n'importe quelle future migration, ont leur place
dans ce fichier.