# Installation locale

Cette page décrit l’installation et le démarrage de la plateforme en local.
Les commandes sont à exécuter depuis la racine du dépôt.

## Prérequis

- Git
- Docker Desktop avec Docker Compose v2
- Node.js `v20.19.6` (version indiquée dans `.nvmrc`)
- Corepack et Yarn `4.18.0` (version définie dans `package.json`)
- Castor `v1.8.1` (version définie dans `.castor-version`)
- `curl` pour installer Castor
- `mkcert`
- Symfony CLI sur macOS (utilisé par `local:system:generate-ssl`)

Mailcatcher et Kibana utilisent explicitement des images `linux/amd64` en local.
Sur les machines ARM, notamment les Mac Apple Silicon, ces deux services
s’exécutent via émulation.

Sur macOS avec Homebrew :

```bash
brew install symfony-cli/tap/symfony-cli mkcert
```

Installer Node.js avec le gestionnaire de versions disponible sur votre poste,
puis sélectionner la version du dépôt. Avec `nvm` :

```bash
nvm install
nvm use
```

Installer ensuite Castor dans `~/.local/bin` :

**Le binaire statique Castor embarque son propre runtime PHP : il ne nécessite
pas de PHP installé sur le poste et ne modifie pas le PHP 8.1 de l’application.**

```bash
mkdir -p "$HOME/.local/bin"
castor_version="$(tr -d '[:space:]' < .castor-version)"
curl -fsSL https://castor.jolicode.com/install | bash -s -- \
    --static \
    --version="$castor_version" \
    --install-dir="$HOME/.local/bin"
export PATH="$HOME/.local/bin:$PATH"
castor --version
```

Si nécessaire, ajouter `export PATH="$HOME/.local/bin:$PATH"` à `~/.zshrc`
ou `~/.bashrc`.

> **Activer l’autocomplétion Castor** permet de compléter les noms de commandes,
> les alias et les options avec la touche Tab. Pour Zsh, ajouter la ligne suivante
> à la fin de `~/.zshrc`, puis ouvrir un nouveau terminal :
>
> ```zsh
> eval "$(castor completion zsh)"
> ```
>
> Pour les autres shells ou les autres méthodes d’installation, consulter
> `castor completion --help`.

Vérifier les outils :

```bash
corepack enable
corepack yarn --version
castor local:system:doctor
```

L’alias `castor doctor` correspond à `castor local:system:doctor` et accepte les
mêmes options.

`doctor` vérifie les outils nécessaires, les versions de Node.js, Yarn et
Castor épinglées dans le dépôt, ainsi que l’accès au daemon Docker. Il affiche
tous les diagnostics avant de retourner un échec si un prérequis manque,
si une version diffère ou si Docker est arrêté ou inaccessible. PHP et Composer
ne sont pas requis sur le poste : ils s’exécutent dans le container applicatif.
La vérification Yarn passe par Corepack et n’autorise aucun téléchargement.
La commande `corepack yarn --version` ci-dessus prépare la version de Yarn
épinglée si elle n’est pas encore disponible ; Docker doit être démarré pour
que le contrôle du daemon réussisse.

## Première installation

### 1. Certificats locaux

```bash
castor local:system:generate-ssl
```

La commande est idempotente si `infrastructure/services/local/nginx/ssl/capco.pem`
existe déjà.

### 2. Containers

```bash
castor local:infrastructures:build
castor local:infrastructures:up
```

MySQL et Elasticsearch stockent leurs données dans les volumes nommés
`capco_database_data` et `capco_elasticsearch_data`. Ces volumes sont conservés
lors d'une recréation des containers et après un arrêt avec `docker compose down`
sans l'option `--volumes`.

Pour reconstruire les images sans cache :

```bash
castor local:infrastructures:build --no-cache
```

### 3. Dépendances JavaScript

```bash
corepack yarn install --immutable
```

### 4. Dépendances PHP

Si `.env.local` n’existe pas encore, générer les valeurs locales par défaut
avec `castor local:app:setup-default-env-vars` ; cette commande écrase le fichier
s’il existe déjà.

La commande est exécutée dans le container applicatif :

```bash
castor local:app:composer
```

Cette étape doit précéder la génération de la base, car le container doit
disposer de l’autoload Composer pour exécuter Symfony.

### 5. Base de données et fixtures

```bash
castor local:database:reset --environment=dev
```

Cette commande réinitialise la base locale, charge les fixtures et prépare les
fichiers média. Elle est destructive pour les données locales.

Le marquage des migrations affiche uniquement un résumé en cas de succès.
Pour voir le détail, utiliser `castor local:database:reset -v` ; les erreurs
restent affichées dans tous les cas.

Le reset crée le schéma depuis les entités Doctrine actuelles et marque les
migrations comme exécutées sans les lancer. Pour appliquer les migrations
en attente sur une base existante, sans la réinitialiser ni recharger les fixtures :

```bash
castor local:database:migrate --environment=dev
```

### 6. GraphQL, assets et queues

```bash
castor local:app:generate-graphql
castor local:app:install-assets
castor local:app:rabbitmq-queues
```

`generate-graphql` nettoie le cache Symfony, compile les classes PHP, régénère
l'autoload et les quatre schémas, puis compile Relay pour le frontend principal
et admin-next. Les dépendances JavaScript doivent déjà être installées.

`rabbitmq-queues` efface et recrée le vhost RabbitMQ ; cette étape sert à la
première installation et ne doit pas être lancée systématiquement lors d'un
changement de branche.

### 7. Watcher et consumers

Dans un terminal dédié au frontend legacy :

```bash
corepack yarn build:watch
```

`build:watch` reste actif. Dans un autre terminal, démarrer les consumers
RabbitMQ/Swarrot et Messenger :

```bash
castor local:app:start-consumers
```

Le container `admin-next` installe ses dépendances, compile Relay et démarre
son serveur automatiquement via `admin-next/run.sh`.

## Accès local sur macOS

Configurer les domaines locaux :

```bash
castor local:system:configure-vhosts
```

La commande configure `/etc/hosts` et, sur macOS, rattache le domaine
`capco.dev` au proxy Symfony. Elle peut demander le mot de passe administrateur.

## Utilisation quotidienne

Les tâches locales Docker disposent des alias `up`, `stop`, `restart`,
`recreate`, `down`, `ps` et `logs`. Ils acceptent les mêmes options que les
commandes complètes, par exemple `castor recreate --no-cache`.

```bash
castor local:infrastructures:up
castor local:app:start-consumers
```

Voir l’état et les logs :

```bash
castor local:infrastructures:ps
castor local:infrastructures:logs
```

Après un changement de branche, reconstruire les images et recréer les
containers en conservant les volumes MySQL et Elasticsearch :

```bash
castor local:infrastructures:recreate
```

Pour reconstruire sans cache, ajouter `--no-cache`. Cette commande ne
réinstalle pas les dépendances applicatives et ne lance pas les migrations.

Arrêter ou redémarrer :

```bash
castor local:app:stop-consumers
castor local:infrastructures:stop
castor local:infrastructures:restart
```

`restart` redémarre les containers existants sans reconstruire leurs images ni
appliquer les changements de configuration Compose. Pour supprimer les
containers et les réseaux tout en conservant les volumes de données :

```bash
castor local:infrastructures:down
```

## Workflows applicatifs courants

Toutes les commandes ci-dessous s’exécutent avec le préfixe `castor`.

Les alias `graphql`, `cc`, `console`, `assets` et `composer` correspondent
respectivement à `local:app:generate-graphql`, `local:app:clear-cache`,
`local:app:console`, `local:app:install-assets` et
`local:app:composer`. Ils acceptent les mêmes options que les commandes
complètes, par exemple `castor graphql` ou
`castor console --command-name="cache:clear"`.

Sans argument, `composer` installe les dépendances PHP avec les options du projet.
Pour exécuter une autre commande Composer, transmettre ses arguments après `--` :

```bash
castor composer -- require vendor/package
castor composer -- require --dev vendor/package
castor composer -- update vendor/package
castor composer -- dump-autoload
```

Toutes ces commandes s’exécutent dans le container applicatif.

Les alias `rabbitmq`, `enable` et `disable` correspondent à
`local:app:rabbitmq-queues`, `local:app:toggle-enable` et
`local:app:toggle-disable`. `rabbitmq` efface et recrée le vhost et les queues ;
`enable` et `disable` exigent le nom du flag en argument, par exemple
`castor enable multilangue` ou `castor disable multilangue`. L’option
`--environment` reste disponible, avec `test` comme environnement par défaut.

| Commande | Usage |
| --- | --- |
| `local:database:reset` | Repartir des fixtures : base, médias, feature flags, compteurs et Elasticsearch. |
| `local:qa:regenerate-test-data` | Recharger les fixtures de test et réenregistrer le dump MySQL ainsi que le snapshot ES utilisés par Cypress. |
| `local:database:migrate` | Appliquer les migrations en attente sur la base existante, sans reset ni rechargement des fixtures. |
| `local:app:generate-graphql` | Régénérer le backend GraphQL et les deux frontends Relay. |
| `local:app:clear-cache` | Vider le cache Symfony. |
| `local:app:console --command-name="…"` | Exécuter une commande Symfony ; les arguments supplémentaires se passent après `--`. |
| `local:app:install-assets` | Installer les assets Symfony. |
| `local:app:composer` | Installer les vendors PHP par défaut, ou exécuter une commande Composer avec des arguments après `--`. |

L’alias `castor reset-db` correspond à `castor local:database:reset` et accepte
les mêmes options. Il supprime les données locales avant de recharger les fixtures.

`reset` supprime les données locales, crée le schéma depuis les entités actuelles,
marque les migrations comme exécutées sans les lancer, puis recharge les fixtures,
reconstruit Elasticsearch.
Il ne teste donc pas les migrations. `migrate`
exécute les migrations en attente sur les données existantes ; leur SQL peut
modifier ces données, mais la commande ne réinitialise pas la base, les médias,
les feature flags ou Elasticsearch.
Ces workflows utilisent `dev` par défaut et acceptent `--environment=test`.

Pour reconstruire uniquement l’index Elasticsearch actif depuis la base
actuelle, sans recharger les fixtures :

```bash
castor local:database:reset-elasticsearch
```

Cette commande crée un nouvel index et le peuple ; elle conserve les anciens
index et les index non applicatifs. La feature flag `indexation` doit être active.

Les commandes Yarn couvrent les périmètres suivants :

- `corepack yarn generate-graphql-files` : backend et fichiers de schéma
- `corepack yarn relay` : backend, fichiers de schéma et Relay du frontend principal
- `castor local:app:generate-graphql` : backend, fichiers de schéma et les deux frontends Relay

L’option `--backend-only` de `generate-graphql` limite la génération aux classes
PHP et aux fichiers de schéma.

## Tests

Avant Cypress, vérifier que `admin-next/.env.local` contient :

```env
NEXT_PUBLIC_SYMFONY_ENV=test
```

Jest :

```bash
corepack yarn test
corepack yarn test-e2e-types
corepack yarn test-e2e-mutations
```

Cypress :

```bash
castor local:qa:regenerate-test-data --confirm
corepack yarn cy:open
corepack yarn cy:run
corepack yarn cy:run:ci
```

Les hooks Jest et Cypress utilisent Castor pour restaurer la base, Elasticsearch
et les queues RabbitMQ. Cypress ne réécrit plus automatiquement les sauvegardes
de référence au début de `cy:run`.

### Mise à jour des références d’exports

Pour mettre à jour une référence d’export précise, utiliser l’option
`--updateSnapshot` de la commande d’export concernée, depuis une base contenant
les fixtures attendues par les tests :

```bash
castor console --command-name=capco:export:users --environment=test -- --updateSnapshot --force --delimiter=,
```

Cet exemple met à jour uniquement les références de l’export utilisateurs,
sans activer durablement le feature flag `export`.

## Réinitialisation et dépannage

Ouvrir une console MySQL interactive sur la base locale `symfony` :

```bash
castor mysql
```

Cet alias correspond à `local:database:mysql`. Pour exécuter une requête
ponctuelle via Doctrine :

```bash
castor console --command-name=doctrine:query:sql -- "SELECT 1"
```

Réinitialiser la base locale :

```bash
castor local:database:reset --environment=dev
```

Sauvegarder la base locale :

```bash
castor local:qa:save-db
ls -lh var/db.backup
```

La sauvegarde est écrite dans `var/db.backup` sans sortie console en cas de
succès.

Régénérer les données de test Cypress — opération destructive qui recharge les
fixtures en environnement `test`, puis réécrit `var/db.backup` et le snapshot
Elasticsearch :

```bash
castor local:qa:regenerate-test-data --confirm
```

Réinitialiser les queues et les consumers :

```bash
castor local:app:rabbitmq-queues
castor local:app:stop-consumers
castor local:app:start-consumers
```

Supprimer les containers et leurs volumes, y compris la base MySQL et les index
Elasticsearch persistants — opération destructive :

```bash
castor local:infrastructures:destroy
```

Ajouter `--remove-images` pour supprimer également les images des services.
