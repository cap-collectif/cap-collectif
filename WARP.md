# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview & key documentation

- This is the main developer repository for the Cap Collectif participatory platform. It is a monolithic Symfony 5.4 / PHP 8.1 backend with a React/TypeScript frontend and a Next.js-based back-office (`admin-next`).
- The platform exposes a large GraphQL API (via Overblog GraphQLBundle) that is consumed by both the legacy React frontend and the `admin-next` Next.js app.
- Canonical documentation lives outside this repo:
  - Technical docs and install guide: https://tech.cap-collectif.com/ (see in particular the "Install" and "Quick links" pages referenced from the root `README.md`).
  - Developer portal / OSS overview: https://developers.cap-collectif.com/ (linked from `.oss/README.md`).
- ADRs (Architecture Decision Records) are maintained under `ADR/adr-docs`. Use those documents to understand and preserve historical architectural decisions.

## High-level architecture

### Backend (Symfony / PHP)

- Symfony application code lives under `src/Capco/**`, with bundles such as `AppBundle`, `AdminBundle`, and `UserBundle`.
- HTTP entrypoints, configuration, and templates follow standard Symfony conventions:
  - Symfony config: `config/**`
  - Console entrypoint: `bin/console`
  - Twig templates: `templates/**` and some legacy `src/**/Resources/views/**`
  - Doctrine entities, repositories, domain services, and message processors live under `src/Capco/**`.
- GraphQL backend:
  - Uses Overblog GraphQLBundle, heavily documented in `doc/graphql.md`.
  - YAML-based schema definitions are under `src/Capco/AppBundle/Resources/config/GraphQL/**`, organized by environment (`internal`, `public`, `preview`, `dev`) and increasingly by feature folder.
  - PHP resolvers and mutations are under `src/Capco/AppBundle/GraphQL/**`.
  - Compiled schema snapshots for tooling live at the repo root (`schema.public.graphql`, `schema.preview.graphql`, `schema.internal.graphql`, `schema.dev.graphql`).
- Asynchronous work and email delivery:
  - RabbitMQ consumers, processors, and mailer messages are described in `doc/mailer.md` and implemented under `src/Capco/AppBundle/Processor/**` and `src/Capco/AppBundle/Mailer/**`.
  - Swarrot is used to wire Symfony console consumers to RabbitMQ queues.
- Search and analytics:
  - Elasticsearch mappers, normalizers, and related config live under `src/Capco/AppBundle/Elasticsearch/**` and `src/Capco/AppBundle/Normalizer/**` (see `doc/elasticsearch.md`).

### Frontend (legacy React / Webpack)

- The legacy frontend is a React/TypeScript SPA built with Webpack:
  - Source lives mainly under `frontend/js/**`.
  - Entry points and Webpack config are in `webpack/webpack.client*.js` and `webpack/config.js`.
  - SCSS assets for the public and admin UIs live under `src/Capco/AppBundle/Resources/scss/**` and are bundled via Webpack.
- Webpack aliases expose shared code across the repo (see `webpack/webpack.client.js` and `jest.config.js`), e.g.:
  - `~` → `frontend/js`
  - `~ui` / `~ds` → UI and design system components under `frontend/js/components/**`.
  - `~relay` / `@relay` → GraphQL Relay-generated artifacts in `frontend/js/__generated__/~relay`.
  - `@shared` and `@cap-collectif/form` → shared code consumed by `admin-next`.
- Frontend tests:
  - Jest test configuration for the legacy frontend is in `jest.config.js`.
  - Tests live under `frontend/**` and are named `*-test.ts` / `*-test.tsx`, with snapshots under `__snapshots__/`.

### Admin-next (Next.js back-office)

- `admin-next/` contains a Next.js app implementing the newer administration UI.
- It consumes the same GraphQL API and shares some code with the legacy frontend via the aliases mentioned above.
- Important directories:
  - `admin-next/pages/**` or `admin-next/app/**` (depending on the route) define the Next.js pages.
  - `admin-next/components/**` contains reusable admin UI components.
  - `admin-next/shared/**` contains shared React and form libraries used across multiple admin features and by the legacy frontend.

### Tests and quality stack (PHP + JS)

- PHP tests:
  - PHPUnit configuration: `phpunit.xml` (tests under `tests/**`).
  - PHPSpec specs: `spec/**`, configured via `phpspec.yml`.
  - Behat BDD tests: `features/**` with profiles configured in `behat.yml` (both browser-based end-to-end scenarios and command/consumer tests).
- JavaScript/TypeScript tests:
  - Unit and integration tests via Jest in both `frontend/**` and `admin-next/**`.
  - End-to-end browser tests via Cypress in `cypress/**`.
- Quality and tooling:
  - `doc/codeQuality.md` documents backend code style and tooling (PHP-CS-Fixer, PHPStan, etc.).
  - Pre-commit hooks are configured via `lint-staged` in `package.json` and additional PHP tooling scripts.

### Infrastructure & local environment

- Local and CI environments are orchestrated via Python Fabric/Invoke tasks defined under `infrastructure/deploylib/**` and exposed via `fabfile.py`.
- The main pattern is to call tasks via Pipenv + Fabric collections:
  - Collections: `local.*` for developer workflows, `ci.*` for CI.
  - Sub-collections under `local.*` include `app`, `database`, `infrastructures`, `qa`, and `system`.
- The Symfony app is typically exposed locally at `https://capco.dev` using the Symfony binary and custom proxy configuration (see the "Development on MacOS" section in `README.md`).

## Core commands (root of repo)

All commands below are run from the repository root unless otherwise specified.

### Dependency installation

- Node/Yarn dependencies (monorepo using Yarn workspaces):

  ```bash
  yarn install
  ```

- Python tooling for Fabric/Invoke-based tasks:

  ```bash
  pipenv install
  ```

- PHP dependencies via Composer:

  ```bash
  composer install
  ```

(Exact setup steps and system prerequisites are described in the external install docs; use those as the source of truth.)

### Local Docker stack & Symfony app

Fabric tasks are namespaced; use `pipenv run fab` with the `local.*` namespace.

- Build or rebuild local Docker images:

  ```bash
  pipenv run fab local.infrastructures.build
  ```

- Start the full local stack (Docker services, Symfony app, etc.):

  ```bash
  pipenv run fab local.infrastructures.up
  ```

- Stop or reboot the stack:

  ```bash
  pipenv run fab local.infrastructures.stop
  pipenv run fab local.infrastructures.reboot
  ```

- Initial Symfony deployment inside the containers (installs PHP deps, compiles GraphQL, warms cache, sets up assets, and configures local `.env.local` when appropriate):

  ```bash
  pipenv run fab local.app.deploy
  ```

- Generate or refresh the local database schema:

  ```bash
  pipenv run fab local.database.generate
  ```

- Set up default local environment variables (`.env.local`):

  ```bash
  pipenv run fab local.app.setup-default-env-vars
  ```

- Start/stop background consumers (RabbitMQ via Swarrot + supervisord):

  ```bash
  pipenv run fab local.app.start-consumers
  pipenv run fab local.app.stop-consumers
  ```

> Many backend tests (Behat, some Jest e2e tests, and Cypress) assume the Docker stack, database, and queues are up and the app is reachable at local domains (e.g. `https://capco.dev`).

### Webpack/React frontend (legacy UI)

From the repo root, use the `package.json` scripts for the legacy frontend under `frontend/js`.

- TypeScript typecheck (frontend):

  ```bash
  yarn ts
  ```

- Development build (bundles assets to `public/**`):

  ```bash
  yarn build
  ```

- Watch mode for local development (hot client config):

  ```bash
  yarn build:watch
  ```

- Production build:

  ```bash
  yarn build:prod
  ```

- Lint TypeScript frontend sources with ESLint:

  ```bash
  yarn lint
  ```

- Check for circular dependencies in the Webpack graph:

  ```bash
  yarn build:check-circular-deps
  ```

### GraphQL / Relay tooling

These scripts keep the backend GraphQL schema and frontend Relay artifacts in sync.

- Generate GraphQL schema files and compile backend schemas:

  ```bash
  yarn generate-graphql-files   # clears cache, compiles GraphQL, dumps schemas
  ```

- Compile frontend Relay artifacts (one-shot):

  ```bash
  yarn build-relay-schema
  ```

- Full GraphQL + Relay rebuild (recommended when changing backend GraphQL types or resolvers used by the frontend):

  ```bash
  yarn relay
  ```

- Watch mode for Relay compiler during frontend development:

  ```bash
  yarn relay:watch
  ```

### Jest tests (legacy frontend, GraphQL e2e)

Root-level Jest configuration (`jest.config.js` and `jest.config.e2e.js`) drives different suites.

- Run all unit/integration tests for the legacy frontend:

  ```bash
  yarn test
  ```

- Run tests continuously in watch mode:

  ```bash
  yarn test:watch
  ```

- Run Node-based GraphQL end-to-end tests:

  ```bash
  yarn test-e2e           # full suite
  yarn test-e2e:watch    # watch mode (ensures local feature toggle is enabled via Fabric)
  ```

- Split GraphQL E2E suites:

  ```bash
  yarn test-e2e-types      # non-mutation tests
  yarn test-e2e-mutations  # mutation tests only
  ```

- Run a single Jest test file (any suite) by passing a path or pattern after `--`:

  ```bash
  yarn test -- frontend/js/components/Proposal/ProposalPage-test.tsx
  # or, for e2e config
  yarn test-e2e -- features/graphql-api/public/someFeature/someTest.js
  ```

### Cypress end-to-end tests

Cypress tests live under `cypress/**` and are exposed via root `package.json` scripts.

- Open Cypress in interactive mode:

  ```bash
  yarn cy:open
  ```

- Run the Cypress suite headlessly (development and CI variants):

  ```bash
  yarn cy:run
  yarn cy:run:ci
  ```

### Admin-next (Next.js admin)

`admin-next/` is a Yarn workspace with its own scripts.

- Start the admin-next dev server (from the repo root):

  ```bash
  yarn workspace admin-next dev
  ```

- Alternatively, from inside `admin-next/`:

  ```bash
  cd admin-next
  yarn dev
  ```

- Build and serve the admin-next app:

  ```bash
  yarn workspace admin-next build
  yarn workspace admin-next start
  ```

- Run admin-next tests and lint:

  ```bash
  yarn workspace admin-next test
  yarn workspace admin-next lint
  ```

### Backend PHP quality and tests

Backend quality tooling is surfaced as a Yarn script and via Composer / Fabric.

- Full PHP quality pass (CS fixer + PHPStan + PHPSpec):

  ```bash
  yarn php:quality
  ```

- PHPUnit tests (if you need to invoke them directly instead of via higher-level scripts):

  ```bash
  php -d memory_limit=-1 bin/phpunit
  ```

- PHPSpec specs (direct invocation):

  ```bash
  php -d memory_limit=-1 bin/phpspec run
  ```

- Behat end-to-end and email snapshot tests (require Docker stack and test data):

  ```bash
  php -d memory_limit=-1 ./bin/behat -p commands --tags=dev
  ```

Use the profiles and tags defined in `behat.yml` to scope scenarios when iterating on a specific feature.

### Translations

Translations are synchronized through Localise.biz and tooling under `packages/trad-*` and `translations/`.

- Never edit files directly under `translations/`; they are generated.
- To fetch translations from the remote service into this repo:

  ```bash
  yarn trad
  ```

(Additional translation analysis tools live in `packages/trad-analyser` and `packages/trad-hook` and are typically run by maintainers following the guidance in their respective `README.md` files.)

## How to use this file as an agent

- Prefer running scoped tests and linters based on the part of the system you are modifying:
  - Frontend React changes → `yarn lint`, `yarn ts`, `yarn test` (or a single Jest file).
  - Admin-next changes → `yarn workspace admin-next lint`, `yarn workspace admin-next test`.
  - Backend PHP changes → `yarn php:quality` and, where relevant, targeted PHPUnit or Behat suites.
- For changes that touch GraphQL types, resolvers, or front-end queries:
  - Regenerate schemas and Relay artifacts with `yarn relay` (or `yarn generate-graphql-files` + `yarn build-relay-schema`).
- For end-to-end behaviours (email flows, exports, queues, etc.), ensure the Docker-based local stack is running (`pipenv run fab local.infrastructures.up` + `pipenv run fab local.app.deploy` + `pipenv run fab local.database.generate`) before executing Cypress, Behat, or Jest E2E suites.
