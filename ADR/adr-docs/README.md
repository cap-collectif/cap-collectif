# 002-README

## 📘 ADR (Architecture Decision Record)

### Qu'est-ce qu'un ADR ?

Un **ADR (Architecture Decision Record)** est un document court qui décrit des décisions importantes prises concernant l’architecture ou l’organisation technique d’un projet.  
Il permet de garder une trace des choix effectués, du contexte, des alternatives envisagées et des conséquences.

### À quoi ça sert ?
- 📂 **Historiser** les décisions techniques du projet  
- 👥 **Partager** la logique derrière un choix avec l’équipe  
- 🔄 **Faciliter** la compréhension et la mise à jour des décisions
- 🧭 **Guider** les futures évolutions en évitant de reposer les mêmes questions

### Historique
De nombreuses décisions techniques sont prises au fil du développement du projet.
Le turnover fait que les raisons pour lesquelles certains choix ont été faits se perdent.
Il est donc plus difficile et chronophage de creuser certains sujets techniques, ou de challenger certaines décisions pour lesquelles on n'a pas toutes les clés de compréhension, ou tout le contexte.
L'ADR est là pour pallier ce problème.

### Comment utiliser le dossier ADR ?

1. **Créer un nouveau fichier** dans le dossier `ADR` pour chaque décision importante.
Ce fichier doit suivre le format suivant : `001-file_name_snakecase.md`

2. **Suivre une structure simple**, par exemple :
   - **Titre** : résumé de la décision  
   - **Contexte** : pourquoi cette décision est nécessaire  
   - **Décision** : le choix retenu  
   - **Alternatives** : options envisagées et pourquoi elles ont été rejetées  
   - **Conséquences** : impacts positifs et négatifs du choix  
   - **Statut** : proposé, validé, remplacé, etc.

Cette structure est une proposition, vous trouverez un modèle [ici](./ADR_example.md), mais vous pouvez vous en éloigner selon le besoin.

3. **En cas de changement de décision**
Afin d'avoir un meilleur recul sur les décisions techniques majeures, il est primordial de conserver l'historique.
Dans ce cas, on peut créer un nouveau fichier et archiver (dossier `/archive`)la version qui ne s'applique plus en la référençant dans le nouveau fichier.

4. **Assets**
Si besoin d'ajouter des illustrations ou autres fichiers, les déposer dans le dossier `/assets` afin de conserver une arborescence lisible

5. **Flexibilité**
L’ADR permet de centraliser et documenter les décisions et informations clés du projet.
Il est important de suivre une structure claire pour faciliter la recherche et la mise à jour des informations.
Toutefois, l’objectif principal reste le partage des décisions et des connaissances : un ADR utile et compréhensible prime sur le respect strict du template.