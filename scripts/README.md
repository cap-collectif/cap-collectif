# Scripts du projet

Ce répertoire contient les outils partagés par l'équipe et les hooks du projet :

- `audit-report.mjs` et `audit-fix.mjs` : outils d'audit des dépendances, exposés par les commandes `audit:*` du `package.json` racine.
- `docker-pre-commit-hook.sh` : exécution des vérifications PHP dans le conteneur depuis les hooks Git.
- [`agents/`](agents/README.md) : vérifications ciblées et diagnostics utilisés principalement pendant les interventions des agents, exécutés à la demande.

Le classement dépend de l'usage du script, pas de son auteur. Un outil utilisé
par l'équipe reste ici même s'il a été créé par un agent. Les scripts opérationnels
de la CI restent dans `.circleci/` ; les scripts ponctuels d'investigation restent
hors du dépôt, dans un répertoire temporaire.
