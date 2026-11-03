# Scripts du projet

Ce répertoire contient les outils partagés par l'équipe et les hooks du projet :

- `audit-report.mjs` et `audit-fix.mjs` : outils d'audit des dépendances, exposés par les commandes `audit:*` du `package.json` racine.
- `docker-pre-commit-hook.sh` : exécution des vérifications PHP dans le conteneur depuis les hooks Git.
- `generate-email-icons.cjs` : génération des icônes PNG des emails (`public/image/email/`) à partir des icônes de `@cap-collectif/ui` et de la table des icônes de catégorie d'admin-next. À relancer après une mise à jour des icônes du design system : `node scripts/generate-email-icons.cjs` depuis la racine, avec Google Chrome installé (variable `CHROME_PATH` si besoin). Le script réécrit les fichiers PNG existants.
- [`agents/`](agents/README.md) : vérifications ciblées et diagnostics utilisés principalement pendant les interventions des agents, exécutés à la demande.

Le classement dépend de l'usage du script, pas de son auteur. Un outil utilisé
par l'équipe reste ici même s'il a été créé par un agent. Les scripts opérationnels
de la CI restent dans `.circleci/` ; les scripts ponctuels d'investigation restent
hors du dépôt, dans un répertoire temporaire.
