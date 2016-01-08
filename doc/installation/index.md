# Installation

Les environements de développement, de test et de production sont basés sur Docker.

#### Prérequis

On va utiliser Fabric pour faciliter l'intéraction développeur / environement de développement.

```
# vérifier que pip est installé
$ pip --version

# builder les dépendances
$ sudo pip install -r requirements.txt
```

Pour lister les commandes disponibles : ``fab -l``
Il est recommandé d'utiliser le plugin oh-my-zsh pour l'autocompletion des commandes.

#### Préparer sa machine

Pour la suite des prérequis cela dépend de votre OS :

##### Spécifiques à OSX

```
$ fab local.system.macos_install
$ fab local.system.macos_mountnfs
$ fab local.system.configure_vhosts
```

##### Spécifiques à Linux

```
$ fab local.system.linux_docker_install
```

Sinon l'installation manuelle : [OSX](osx.md) ou [Linux](linux.md).
