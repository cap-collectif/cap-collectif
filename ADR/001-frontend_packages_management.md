# 001-ci :

## Retrait du mode --prefer-offline de circle ci

Nous décidons de retirer la possibilité d'installer les dépendances javascript en utilisant le mode `prefer-offline` de Yarn
parce que celui-ci est :
- nous forces à versionner l'intégralité du dossier `node_modules` dans le repository git
- n'a pas d'utilité concrète par rapport à nos besoins puisque nos serveurs ont tous un accès à un internet et peuvent donc récupérer les packages
sur le registry npm
- le temps d'installation des dépendances en ci ne dépasse pas les 3 minutes en téléchargeant les packages depuis le registry npm
et est donc complètement suffisant pour nos besoins