# 001-ci :

## Retrait du mode --prefer-offline de CircleCI

Nous décidons de retirer la possibilité d'installer les dépendances javascript en utilisant le mode `prefer-offline` de Yarn
parce que :
- ça nous force à versionner l'intégralité du dossier `node_modules` dans le repository git
- ça n'a pas d'utilité concrète par rapport à nos besoins, puisque nos serveurs ont tous accès à internet et peuvent donc récupérer les packages
sur le registry npm
- le temps d'installation des dépendances en CI ne dépasse pas les 3 minutes en téléchargeant les packages depuis le registry npm
et c'est donc complètement suffisant pour nos besoins