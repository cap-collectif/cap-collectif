# Local account contracts

These PHPUnit tests characterize the local account lifecycle before replacing FOSUserBundle: registration, confirmation, login/logout, password and email changes, resets, magic links and rate limiting. Tests named `CharacterizationGap` record observed limitations, not permanent product requirements. See [the migration audit](../../../user-tests-audit.md#comportements-observés-nécessitant-une-décision-séparée) for the decisions still needed.

## Running the tests

The application container, MySQL, Redis and the usual test database fixtures must be available. Run all PHP commands inside the application container:

```bash
docker exec -w /var/www capco_application_1 bin/phpunit tests/UserBundle/Functional
docker exec -w /var/www capco_application_1 bin/phpunit tests/UserBundle/Entity/UserTest.php
```

The existing CircleCI `tests/**/*Test.php` glob discovers the concrete test classes.

Run suites that modify feature flags sequentially. Separate PHP processes share Redis configuration; parallel executions require separate storage instances.

## Isolation and boundaries

`AccountWebTestCase` checks the test environment before database writes. Each web test runs in a separate PHP process, retains its kernel across requests and rolls back its SQL transaction at teardown. The helper checks that the transaction stays open, restores the complete feature-flag configuration and removes only the scenario's Redis sessions, including after failed assertions. Registration scenarios make existing custom registration questions optional within their transaction. Canonicalization is exercised through registration, confirmation and login; whitespace preservation, which registration does not accept for email addresses, is checked through the project canonicalizer’s public API in `UserTest`.

HTTP/GraphQL scenarios exercise real forms, validators, account management, password hashing, persistence and session security. Mail delivery, message publication and Elasticsearch indexation are replaced by doubles; magic links use generated RSA keys through a filesystem double. These tests do not prove delivery or indexation. Sessions use the real Redis handler. Diagnostics are retained in `account-contract.log` under the kernel log directory.

Rate-limiter tests use real limiters with isolated in-memory caches and an explicit non-test environment, and separately verify the test-environment bypass. The magic-link HTTP scenario injects this limiter configuration to verify the rejection payload and persisted effects. This does not prove Redis rate-limit persistence or that limiting runs by default in the HTTP test environment.

## Choice of runner

Follow the [PHPUnit ADR](../../../ADR/001-phpunit_tests.md) and its topic guides. PHPUnit covers these mixed GraphQL/HTTP journeys because credentials changed or confirmed through GraphQL must work with the real login endpoint and session, and account anonymization must revoke another session. It also supports fresh Doctrine reads and rollback on the connection used by the HTTP action.

Use the existing Jest API runner for independent GraphQL contracts, as described in the [Jest ADR](../../../ADR/001-jest_tests.md); avoid duplicating these complete journeys there.
