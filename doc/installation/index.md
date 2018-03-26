# Installation

Les environements de développement, de test et de production sont basés sur Docker.

#### Prérequis

On va utiliser Fabric pour faciliter l'intéraction développeur / environement de développement.

```
# vérifier que pip est installé
$ pip --version

# installer les dépendances
$ sudo pip install docker-compose==1.8.0 Fabric==1.10.2
```

##### Erreurs possibles

Si vous avez l'erreur suivante en lançant docker-compose : 

```
$ [...] ImportError: cannot import name _thread
```

Il faut pour corriger le problème réinstaller six : 

```
pip install -I six
```

source: https://eddyerburgh.me/fix-docker-compose-importerror-cannot-import-name-_thread


Pour lister les commandes disponibles : ``fab -l``
Il est recommandé d'utiliser le plugin oh-my-zsh pour l'autocompletion des commandes.

#### Préparer sa machine

On ajoute les vhosts:

```
$ fab local.system.configure_vhosts
```

Pour la suite des prérequis cela dépend de votre OS :

##### Spécifiques à OSX

Recommandé pour les performances:

```
$ fab local.system.dinghy_install
```

Sinon utilisez directement docker-machine:

```
$ fab local.system.docker_machine_install
$ fab local.system.macos_mountnfs
```

##### Spécifiques à Linux

```
$ fab local.system.linux_docker_install
```

Sinon l'installation manuelle : [OSX](osx.md) ou [Linux](linux.md).

## Enfin parfois il faut libérer de la place sur son disque

```
$ fab local.infrastructure.clean
```
La commande suivante va nettoyer complètement les containers, ensuite il faudra rebuild toute l'application!

## Installation des certificats pour le dev

### Chrome
#### Mac OSX
Il suffit juste d'exécuter cette commande :
```
$ fab local.system.sign_ssl()
```
#### Linux
```
$ sudo cp infrastructure/service/local/nginx/ssl/rootCA.crt /etc/ssl/certs/
$ sudo cp infrastructure/service/local/nginx/ssl/rootCA.key /etc/ssl/private
```

### Firefox

Préférences > Afficher les certificats > Onglet Authorité > Importer > infrastructure/service/local/nginx/ssl/rootCA.crt
Préférences > Afficher les certificats > Onglet Vos Certificats > Importer > infrastructure/service/local/nginx/ssl/capco.pfx
