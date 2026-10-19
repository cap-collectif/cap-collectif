# Cypress dans ce projet

Les tests E2E sont situés dans `cypress/e2e/`, avec les pages et commandes partagées dans `cypress/pages/` et `cypress/support/`.

Le fonctionnement local est documenté dans le [skill Cypress local](skills/cypress-local/SKILL.md), qui est la source de vérité pour l'IA : la version Node définie par `.nvmrc` et `package.json`, Corepack, Chrome, sélection de l’environnement Symfony par le hostname `capco.test`, lancement d'une spec et diagnostic.

Les conventions de conception des tests restent définies dans [l'ADR des tests front-end](../../ADR/001-frontend_tests.md) : isolation des données, attente des opérations GraphQL plutôt que des délais fixes, ciblage accessible et préparation déterministe des feature flags Redis avant/après chaque test et exceptions déclarées via `setupFeatureFlags`.
