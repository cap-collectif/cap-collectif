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
- `admin-next/.env.local` must contain the uncommented line `NEXT_PUBLIC_SYMFONY_ENV=test`.
- Run `nvm use` from the repository root before launching Cypress, then verify `node --version` in that same shell.
- Use Yarn through Corepack; do not rely on a globally installed Yarn version.

## Workflows

- One spec: `yarn cy:run --browser chrome --spec e2e/<path>/<name>.cy.ts`.
- Full E2E suite: `yarn cy:run --browser chrome`.
- Interactive runner: `yarn cy:open --browser chrome`.
- Cypress local hooks save/restore database and Elasticsearch state. Expect the run to take longer than the test itself and do not skip `db:restore` in a suite that changes data.

When the page state depends on a GraphQL request, intercept the last required operation and wait
for its alias before asserting the DOM. Do not replace this network synchronization with a fixed
`cy.wait(number)`. Fixed waits for other needs, such as animations or captcha completion, must
remain exceptional and justified according to the Cypress ADR.

## Troubleshooting

- `EPERM` under the Cypress cache or an immediate exit with code `134`: rerun with permission to access the local Cypress cache and browser, keeping the configured Node version and Chrome.
- A selector failure: prefer accessible attributes or existing Cypress page objects, then add an explicit visibility assertion before clicking.

See [the local Cypress guide](../../cypress-local.md) for repository-specific commands and examples.
