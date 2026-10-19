---
name: cypress-local
description: Run and troubleshoot Cap Collectif Cypress E2E tests locally with the project's configured Node version and Chrome. Use when an AI needs to launch a Cypress spec, prepare the local test environment, or diagnose a local Cypress startup failure.
---

# Cypress local

## Quick start

Run the command from the same shell in which the project's Node version is selected and verified:

```bash
nvm use
corepack enable
node --version
cd cypress
yarn cy:run --browser chrome --spec e2e/path/to/test.cy.ts
```

The version check must match `.nvmrc` and satisfy the `node` requirement in `package.json`.
Do not use Electron: it is not available in the local setup.

## Preconditions

- Docker services and the local application must be running at `https://capco.test`.
- The `capco.test` hostname selects Symfony `test`; no `NEXT_PUBLIC_SYMFONY_ENV` override is required.
- Run `nvm use` from the repository root before launching Cypress, then verify `node --version` in that same shell.
- Use Yarn through Corepack; do not rely on a globally installed Yarn version.

## Workflows

- One spec: `yarn cy:run --browser chrome --spec e2e/<path>/<name>.cy.ts`.
- Full E2E suite: `yarn cy:run --browser chrome`.
- Interactive runner: `yarn cy:open --browser chrome`.
- `db:restore` restores the local reference MySQL dump and Elasticsearch snapshot; Cypress does not overwrite them at startup. After changing the local database, prepare these references with `castor local:qa:regenerate-test-data --confirm` before running Cypress. Do not skip the data preparation required by a suite that changes data.

When the page state depends on a GraphQL request, intercept the last required operation and wait
for its alias before asserting the DOM. Do not replace this network synchronization with a fixed
`cy.wait(number)`. Fixed waits for other needs, such as animations or captcha completion, must
remain exceptional and justified according to the Cypress ADR.

## Feature flags

- Suites declare their overrides with `setupFeatureFlags` from
  `cypress/support/setupFeatureFlags.ts`, directly inside `describe`/`context`, before other hooks.
- The shared support hooks apply the test preset and inherited overrides before every
  test/retry in one task, then restore the preset after every test, including failures.
  Do not configure flags in setup/cleanup hooks with individual enable/disable tasks.
- Nested suites may declare their own overrides; their flags merge with their parent's
  configuration without another Redis reset. Sibling overrides remain independent.
- Use `cy.setFeatureFlags({ calendar: false })` for changes inside a scenario. Consecutive
  calls preserve earlier explicit overrides. Single-flag compatibility commands also use Redis.
- All suites receive the preset, even without `setupFeatureFlags`. MySQL, Elasticsearch
  and other Redis keys are outside this reset.
- The backend validates names and boolean values before an atomic write. An invalid override
  must fail preparation; do not silence this error.

## Troubleshooting

- `EPERM` under the Cypress cache or an immediate exit with code `134`: rerun with permission to access the local Cypress cache and browser, keeping the configured Node version and Chrome.
- A selector failure: prefer accessible attributes or existing Cypress page objects, then add an explicit visibility assertion before clicking.

See [the local Cypress guide](../../cypress-local.md) for repository-specific commands and examples.
