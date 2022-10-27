# GraphQL Config

🇫🇷 Ici se trouve la config GraphQL

[Pour ajouter de la config, merci de le faire dans le dossier de la feature en question](https://github.com/cap-collectif/platform/issues/15099)

Le but étant de structurer un minimum afin d'éviter d'avoir des dossier de 150 fichiers
Si c'est une nouvelle feature, il faire un nouveau dossier
Si ce n'est pas encore migré, continuer comme c'est déjà

```
config
    |- graphql
              |- internal
                       |- entity/fature_name
                                    | - enum
                                    | - mutations
                                    | - objects
                                    | - relay-connection
                                    | - input-object
                                    | - decorator
                                    | - union
                                    | - custom-scalar
```