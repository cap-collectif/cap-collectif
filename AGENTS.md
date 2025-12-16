# AGENTS.md

This file provides guidance to AI coding assistants (Claude Code, Gemini CLI, OpenAI Codex) when working with code in this repository.

Symlinks: `CLAUDE.md` and `GEMINI.md` point to this file.

## Rules for AI Assistants

1. **Comments in English**: Always write code comments in English, regardless of the conversation language.
2. **Default branch is `preprod`**: All new branches should be created from `preprod`, unless explicitly specified otherwise (e.g., urgent production hotfix from `master`).
3. **Consult ADRs**: Before implementing features or making architectural decisions, read relevant Architecture Decision Records in the `ADR/` directory. These documents explain important technical decisions, conventions, and patterns used in the codebase.
4. **Keep documentation in sync**: When making code changes, check if related documentation needs updating. This includes:
   - Local `README.md` files in affected directories
   - This `AGENTS.md` file if patterns/commands/architecture change
   - ADRs if architectural decisions are modified

   **Skip documentation updates for**:
   - Bug fixes that don't change documented behavior
   - Internal refactoring with no public-facing changes
   - Code style or formatting changes
   - Implementation details not covered by existing docs

   **Update documentation when**:
   - Adding/removing/renaming public APIs, commands, or configuration options
   - Changing architectural patterns or conventions
   - Modifying setup/build/test procedures
   - Adding new directories or significant features

   Not every code change needs a doc change—documentation describes the "what" and "why" at a high level.

## Architecture Decision Records (ADR)

| File | Topic |
|------|-------|
| `001-git.md` | Git workflow and branching strategy |
| `001-preprod_deployment_process.md` | Deployment process to preprod |
| `001-frontend_tests.md` | Frontend testing strategy |
| `001-frontend_packages_management.md` | Package management for frontend |
| `001-custom_code.md` | Custom code guidelines |
| `001-translation_keys_naming_convention.md` | Translation key naming conventions |

Each ADR contains: Context, Decision, Alternatives considered, and Consequences. Templates in `ADR/adr-docs/`.

## Project Overview

Cap Collectif is a civic participation SaaS platform built with:
- **Backend**: Symfony 5.4 (PHP 8.1)
- **Frontend**: React 18 with Relay for GraphQL
- **Admin Panel**: Next.js 14 (`admin-next/`) with TypeScript
- **Data Layer**: MySQL + Elasticsearch + Redis
- **Message Queue**: Symfony Messenger (new) + RabbitMQ/Swarrot (deprecated, migrating)

## Patterns to Follow

1. **New mutations**: Input/Payload YAML + PHP class + InternalMutation.types.yaml entry
2. **New entities**: Implement IndexableInterface (if searchable), Ownerable (if owned), use appropriate traits
3. **New async messages**: Use Symfony Messenger (Message + Handler classes)
4. **New fixtures**: Update CustomOrderFilesLocator.php
5. **New voters**: Register in voters.yaml
6. **New DataLoaders**: Configure in graphql_dataloaders.yaml with cachePrefix

## Common Commands

### Build & Development
```bash
yarn build                    # Development build
yarn build:watch              # Watch mode
yarn build:prod               # Production build
yarn relay                    # Full GraphQL rebuild (backend schemas + Relay compiler)
yarn relay:watch              # Watch mode for Relay compiler only
```

### Testing
```bash
# PHPUnit (unit tests) ✅ Active
bin/phpunit                                        # Run all tests
bin/phpunit tests/UnitTests                        # Unit tests only
bin/phpunit --filter=TestClassName                 # Run specific test

# Jest (API tests) ✅ Active
yarn test                     # Unit tests
yarn test:watch               # Watch mode
yarn test-e2e                 # GraphQL API e2e tests
yarn test-e2e-types           # Queries only
yarn test-e2e-mutations       # Mutations only
yarn test-e2e-types -u        # Update query snapshots
yarn test-e2e-mutations -u    # Update mutation snapshots

# Cypress (E2E tests) ✅ Active - requires cypress/.env.local with NEXT_PUBLIC_SYMFONY_ENV=test
yarn cy:open                  # Open Cypress UI
yarn cy:run                   # Run Cypress tests

# PHPSpec ⚠️ Legacy (deprecated) - migrate to PHPUnit
bin/phpspec run                                    # Run all specs
bin/phpspec run --format=progress --no-interaction # CI mode

# Behat ⚠️ Legacy (deprecated) - migrate to Cypress
pipenv run fab local.qa.behat                    # All tests
pipenv run fab local.qa.behat --suite=bp         # Specific suite
pipenv run fab local.qa.behat --tags=@mytag      # By tag

# Static Analysis
php -d memory_limit=-1 bin/phpstan analyse         # PHPStan
```

### Linting & Quality
```bash
yarn lint                     # ESLint
yarn prettier                 # Format JS/TS/YAML
yarn php:quality              # PHP CS Fixer + PHPStan + PHPSpec
bin/php-cs-fixer fix --config=.php-cs-fixer.dist.php -v
```

### Fabric Commands (Docker & Infrastructure)
```bash
pipenv run fab local.infrastructures.up             # Start Docker containers
pipenv run fab local.infrastructures.stop           # Stop Docker containers
pipenv run fab local.infrastructures.reboot         # Restart Docker containers
pipenv run fab local.database.generate              # Reinitialize DB + Fixtures + Elasticsearch
pipenv run fab local.app.clear-cache                # Clear Symfony cache
pipenv run fab local.qa.restore-db                  # Restore test database
pipenv run fab local.qa.compile-graphql             # Compile GraphQL schema
pipenv run fab local.qa.graphql-schemas             # Dump GraphQL schemas
```

### Symfony Console Commands
```bash
# Feature flags
php -d memory_limit=-1 bin/console capco:toggle:enable <flag>
php -d memory_limit=-1 bin/console capco:toggle:disable <flag>
php -d memory_limit=-1 bin/console capco:toggle:list

# Elasticsearch
php -d memory_limit=-1 bin/console capco:es:create
php -d memory_limit=-1 bin/console capco:es:populate

# Run any Symfony command via fabric
pipenv run fab local.app.cmd --commandName="<cmd>"
```

## Architecture

### Backend Structure (`src/Capco/`)
- **AppBundle**: Main application (entities, GraphQL, services, commands)
- **AdminBundle**: Sonata admin configuration
- **UserBundle**: FOSUserBundle extension
- **ClassificationBundle**: Category/tag system

### GraphQL (4 Schemas → Internal is the standard)
Schema files at project root, types in `src/Capco/AppBundle/Resources/config/graphql/`:

| Schema | File | Status |
|--------|------|--------|
| **internal** | `schema.internal.graphql` | **Active** - All new development goes here |
| public | `schema.public.graphql` | Rarely used, will be removed |
| preview | `schema.preview.graphql` | Rarely used, will be removed |
| dev | `schema.dev.graphql` | Rarely used, will be removed |

> **Note**: Only use `internal` schema for new features. The other 3 schemas are rarely used and will be removed in the future.

GraphiQL endpoints:
- `https://capco.dev/graphiql/internal` - Internal schema
- `https://capco.dev/graphiql` - Public schema
- `https://capco.dev/graphiql` with header `Accept: application/vnd.cap-collectif.preview+json` - Preview schema

### GraphQL Type Organization
New features use feature-based folders under `src/Capco/AppBundle/Resources/config/graphql/internal/`:
```
<FeatureName>/
  |- enum/
  |- input-object/
  |- mutations/
  |- objects/
  |- relay-connection/
  |- interfaces/
```

### Mutation Pattern
Every mutation requires:
1. **Input type** (`XInput.types.yaml`) - `type: relay-mutation-input`
2. **Payload type** (`XPayload.types.yaml`) - `type: relay-mutation-payload` with `errorCode` field
3. **PHP class** implementing `MutationInterface` in `src/Capco/AppBundle/GraphQL/Mutation/`
4. **Declaration** in `InternalMutation.types.yaml`:
```yaml
myMutation:
    access: "@=hasRole('ROLE_USER')"  # or service-based access
    builder: 'Relay::Mutation'
    builderConfig:
        inputType: MyMutationInput
        payloadType: MyMutationPayload
        mutateAndGetPayload: '@=mutation("Capco\\AppBundle\\GraphQL\\Mutation\\MyMutation", args, getUser())'
```

### Global IDs
Base64 encoding of `type:uuid`. Register new types in `GlobalIdResolver.php` (`AVAILABLE_TYPES` constant).

Helper commands: `capco:decode-global-id`, `capco:encode-global-id`

### DataLoaders
Located in `src/Capco/AppBundle/GraphQL/DataLoader/`. Extend `BatchDataLoader`, configure in `/config/packages/graphql_dataloaders.yaml` with caching options.

### Message Queue

**Symfony Messenger** (recommended for new features):
- Configuration in `/config/packages/messenger.yaml`
- Messages in `src/Capco/AppBundle/Messenger/Message/`
- Handlers in `src/Capco/AppBundle/Messenger/Handler/`

**Swarrot/RabbitMQ** (deprecated, migrating progressively):
- Configuration in `/config/packages/swarrot.yaml` with 50+ message types
- Example types: `proposal.create`, `opinion.update`, `elasticsearch.indexation`, `user.email`
- Processors in `src/Capco/AppBundle/Processor/` follow naming: `<Entity><Action>Processor.php`

> **Note**: Use Symfony Messenger for all new async features. Swarrot is deprecated and will be migrated over time.

### Entity Patterns
Key traits in `src/Capco/AppBundle/Traits/`:
- `UuidTrait` - UUID primary keys
- `TimestampableTrait` - createdAt/updatedAt
- `PublishableTrait` - publishedAt, draft status
- `ModerableTrait` - moderation support
- `OwnerableTrait` - ownership by User or Organization

**Ownerable pattern**: Many entities implement `Ownerable` interface allowing ownership by either `User` or `Organization`.

### Authorization
Security voters in `src/Capco/AppBundle/Security/`:
- Extend `AbstractOwnerableVoter` for owner-based permissions
- Standard operations: `VIEW`, `CREATE`, `EDIT`, `DELETE`, `EXPORT`, `DUPLICATE`
- Register new voters in `config/packages/voters.yaml`

GraphQL access patterns:
```yaml
# Role-based
access: "@=hasRole('ROLE_ADMIN')"

# Service-based (complex logic)
access: '@=service("Capco\\AppBundle\\GraphQL\\Mutation\\DeleteEventMutation").isGranted(args["input"]["eventId"], getUser())'
```

### Feature Flags
Using `qandidate_toggle` with Redis. Access via `window._capco_featureFlags` on frontend.

### Frontend
- **Main**: `frontend/js/` - React 18 + Redux + Relay
- **Admin-Next**: `admin-next/` - Next.js 14 + TypeScript, uses `schema.internal.graphql`
- **Component Library**: `@cap-collectif/ui` (CapUI)

### Test Structure
- `spec/` - PHPSpec (mirror source structure)
- `tests/` - PHPUnit
- `features/` - Behat (organized by area: front, back, graphql-api)
- `features/graphql-api/` - GraphQL snapshot tests

### Fixtures
Located in `fixtures/` with folders:
- **`Dev/`** - Active, used for development
- **`Prod/`** - Active, production bootstrap
- `Qa/` - Legacy (deprecated)
- `Benchmark/` - Legacy (deprecated)

> **Important**: Add new fixtures to `src/Capco/AppBundle/DataFixtures/ORM/CustomOrderFilesLocator.php` for correct loading order.

## Key Configuration Files

| File | Purpose |
|------|---------|
| `config/packages/graphql.yaml` | GraphQL schema config |
| `config/packages/messenger.yaml` | Symfony Messenger config (new) |
| `config/packages/swarrot.yaml` | Swarrot config (deprecated) |
| `config/packages/voters.yaml` | Security voter registration |
| `config/packages/graphql_dataloaders.yaml` | DataLoader config |
| `config/packages/snc_redis.yaml` | Redis config |
| `config/rabbitmq.yaml` | RabbitMQ queues/exchanges |
| `behat.yml` | Behat test suites |

## Other Useful Symfony Commands

```bash
# Data management
capco:load-prod-data          # Load production fixtures
capco:load-benchmark-data     # Load benchmark fixtures
capco:reinit                  # Reset instance

# Import/Export
capco:import:users            # Import users from CSV
capco:export:users            # Export users (use SQL, not GraphQL)
capco:export:consultation
capco:export:debate
```

## Workspaces & Subdirectory Commands

This project uses Yarn workspaces.

> **Important**: Some subdirectories have their own build/test commands that are NOT run by root-level commands.

### admin-next/ (Next.js Admin Panel)
**Has its own Relay compiler** - changes to GraphQL queries in admin-next require running relay in that directory:
```bash
cd admin-next
yarn relay                    # Compile Relay queries (outputs to __generated__/)
yarn relay:watch              # Watch mode
yarn build                    # Build Next.js app
yarn dev                      # Development server (port 3000)
yarn test                     # Jest tests
yarn lint                     # ESLint
yarn ts                       # TypeScript check
```
> **Note**: Root `yarn relay` does NOT compile admin-next queries. Always run `yarn relay` in admin-next when modifying its GraphQL queries.

### cypress/ (E2E Tests)
```bash
cd cypress
yarn cy:open                  # Open Cypress UI
yarn cy:run                   # Run tests (development)
yarn cy:run:ci                # Run tests (CI mode)
yarn lint                     # ESLint
```
Or from root: `yarn cy:open`, `yarn cy:run`

> **Important**: To run Cypress tests locally with proper test environment, create `cypress/.env.local` with:
```
NEXT_PUBLIC_SYMFONY_ENV=test
```

### packages/ (Internal Tools)
- **packages/trad-hook/**: Translation verification tool
- **packages/trad-analyser/**: Translation analysis/sync with Loco
- **packages/graphql-query-analytics/**: Elasticsearch query analytics

These are internal tooling and rarely need manual builds.
