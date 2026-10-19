# Scripts pour les agents

Ces scripts conservent des vérifications ciblées et des diagnostics réutilisables
pour les interventions des agents sur Castor et l'infrastructure de test.
Ils peuvent aussi être lancés par un développeur. Ils complètent les suites de
tests habituelles et s'exécutent à la demande ; leur présence ici ne les ajoute
pas automatiquement à la CI.

Les commandes ci-dessous se lancent depuis la racine du dépôt. Utiliser la version
Node du projet (`.nvmrc`) et le binaire Castor épinglé (`.castor-version`) lorsque
ces outils sont requis. Pour préparer les services réels, consulter
le [guide d'installation locale](../../doc/installation-locale.md).

| Script | Utilité | Prérequis | Commande depuis la racine | Effets éventuels |
| --- | --- | --- | --- | --- |
| `test-castor-ci-workflows.sh` | Vérifie les arguments et l'enchaînement des tâches Castor locales et CI. | Castor, outils shell usuels. | `bash scripts/agents/test-castor-ci-workflows.sh` | Docker simulé ; fichiers temporaires supprimés en sortie. |
| `test-castor-compose-terminal.sh` | Vérifie le terminal transmis à Compose et la propagation des erreurs. | Castor, commande `script`. | `bash scripts/agents/test-castor-compose-terminal.sh` | Docker simulé ; terminaux et fichiers temporaires. |
| `test-castor-doctor.sh` | Vérifie la détection des outils absents, versions incorrectes et Docker arrêté. | Castor. | `bash scripts/agents/test-castor-doctor.sh` | Outils sondés simulés ; fichiers temporaires. |
| `test-castor-toggles.sh` | Vérifie les arguments des commandes de feature toggles. | Castor. | `bash scripts/agents/test-castor-toggles.sh` | Docker simulé ; aucun flag réel modifié. |
| `test-castor-phpunit.sh` | Vérifie la sélection des tests et les rapports JUnit du runner PHPUnit. | Castor, conteneur `capco_application_1` démarré, dépendances PHP installées. | `bash scripts/agents/test-castor-phpunit.sh` | Exécute des tests synthétiques dans le conteneur ; fichiers temporaires sous `var/`, supprimés en sortie. |
| `test-admin-next-readiness.sh` | Vérifie l'attente de disponibilité d'admin-next et les erreurs HTTP. | Bash, `rg`. | `bash scripts/agents/test-admin-next-readiness.sh` | Réponses HTTP simulées ; aucun service réel contacté. |
| `test-cypress-feature-flags-lint.cjs` | Vérifie la règle ESLint de déclaration des feature flags Cypress. | Node, dépendances JavaScript installées. | `node scripts/agents/test-cypress-feature-flags-lint.cjs` | Aucun service ni donnée applicative modifiés. |
| `test-jest-feature-flags.cjs` | Vérifie le preset, les overrides, le nettoyage après échec et les retries Jest. | Node, Castor, dépendances JavaScript et API de test avec Redis disponibles. | `node scripts/agents/test-jest-feature-flags.cjs` | Modifie les flags réels de l'environnement de test, puis rétablit le preset ; tests temporaires avec un échec volontaire attendu. Ne pas exécuter avec une autre suite utilisant les mêmes flags. |
| `benchmark-mysql-restore.sh` | Compare les restaurations MySQL complètes et des seules données, et vérifie leur équivalence. | Conteneur applicatif, MySQL disponible, dump `var/db.backup`. | `docker exec -w /var/www capco_application_1 bash scripts/agents/benchmark-mysql-restore.sh` | Crée une base temporaire et des fichiers temporaires, supprimés en sortie ; ne restaure pas la base applicative. |

## Ajouter ou déplacer un script

- Conserver ici les outils durables destinés principalement aux agents. Un script ponctuel reste dans un répertoire temporaire hors du dépôt.
- Ajouter un court commentaire en anglais en tête du script et une entrée au tableau : utilité, prérequis, commande et effets éventuels.
- Documenter explicitement les services réels et les données modifiées ; ne pas présenter un test d'intégration comme une simulation.
- Corriger les chemins relatifs et les références documentaires lors d'un déplacement.
- Si un script devient un outil partagé par l'équipe ou une étape de CI, le déplacer vers l'emplacement correspondant à cet usage et mettre à jour sa documentation.
