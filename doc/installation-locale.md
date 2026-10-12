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

Vérifier les outils :

```bash
corepack enable
castor local:system:doctor
```

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

Pour reconstruire les images sans cache :

```bash
castor local:infrastructures:build --use-cache=false
```

### 3. Dépendances JavaScript

```bash
corepack yarn install --immutable
```

### 4. Dépendances PHP

La commande est exécutée dans le container applicatif :

```bash
castor local:app:composer --composer-command="install --prefer-dist --no-interaction --ignore-platform-reqs --no-suggest --no-progress"
```

Cette étape doit précéder la génération de la base, car le container doit
disposer de l’autoload Composer pour exécuter Symfony.

### 5. Base de données et fixtures

```bash
castor local:database:generate --environment=dev
```

Cette commande réinitialise la base locale, charge les fixtures et prépare les
fichiers média. Elle est destructive pour les données locales.

Pour appliquer les migrations explicitement :

```bash
castor local:database:generate --environment=dev --migrate=true
```

### 6. Préparation de l’application

```bash
castor local:app:deploy
```

Cette commande installe les dépendances PHP, compile GraphQL, régénère
l'autoload, nettoie et réchauffe le cache Symfony, installe les assets et crée
les queues RabbitMQ. Sur macOS, elle crée `.env.local` avec les valeurs de
développement locales si le fichier est absent, sans écraser un fichier
existant. Elle ne génère pas la base de données.

### 7. Relay, watcher et consumers

Dans un terminal dédié au frontend legacy :

```bash
corepack yarn relay
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

Configurer les domaines locaux comme le faisait Fabric :

```bash
castor local:system:configure-vhosts
```

La commande configure `/etc/hosts` et, sur macOS, rattache le domaine
`capco.dev` au proxy Symfony. Elle peut demander le mot de passe administrateur.

## Utilisation quotidienne

```bash
castor local:infrastructures:up
castor local:app:start-consumers
```

Voir l’état et les logs :

```bash
castor local:infrastructures:ps
castor local:infrastructures:logs
```

Arrêter ou redémarrer :

```bash
castor local:app:stop-consumers
castor local:infrastructures:stop
castor local:infrastructures:reboot
```

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
corepack yarn cy:open
corepack yarn cy:run
corepack yarn cy:run:ci
```

Les hooks Jest et Cypress utilisent Castor pour sauvegarder ou restaurer la
base, Elasticsearch et les queues RabbitMQ.

## Réinitialisation et dépannage

Réinitialiser la base locale :

```bash
castor local:database:generate --environment=dev
castor local:app:deploy
```

Sauvegarder la base locale :

```bash
castor local:qa:save-db
ls -lh var/db.backup
```

La sauvegarde est écrite dans `var/db.backup` sans sortie console en cas de
succès.

Réinitialiser les queues et les consumers :

```bash
castor local:app:rabbitmq-queues
castor local:app:stop-consumers
castor local:app:start-consumers
```

Supprimer les containers et leurs volumes — opération destructive :

```bash
castor local:infrastructures:clean
```
