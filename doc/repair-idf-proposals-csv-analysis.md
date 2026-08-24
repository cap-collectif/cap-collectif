# Restauration des propositions IDF depuis le CSV historique

## Objet

La commande `capco:repair:idf-proposals-from-csv` restaure le contenu des propositions du budget participatif écologique d’Île-de-France à partir du CSV historique.

Ce document décrit le **périmètre final effectivement implémenté**. Il ne présente plus les pistes étudiées puis abandonnées. En particulier, les illustrations ont été exclues à la demande du métier : la commande n’utilise ni `Visuel` ni `url_image` pour créer ou rattacher des médias.

La restauration porte sur :

- quatre champs de `Proposal`, systématiquement reconstruits depuis le CSV ;
- trois champs ou relations de `Proposal`, remplis uniquement lorsqu’ils sont absents ;
- cinq familles de réponses existantes de formulaire, restaurées uniquement lorsqu’elles sont anonymisées ou dans les quelques états vides explicitement acceptés.

La commande ne restaure jamais les comptes utilisateurs, les votes, les médias ou les catégories.

## Périmètre des données

Le fichier analysé contient **4 704 lignes**, **25 colonnes** et **7 éditions** :

| Référence du formulaire | Édition | Lignes CSV |
|---:|---|---:|
| 2 | Édition 1 - Octobre 2020 | 472 |
| 3 | Édition 2 - Avril 2021 | 681 |
| 7 | Édition 3 - Novembre 2021 | 487 |
| 11 | Édition 4 - Novembre 2022 | 587 |
| 15 | Édition 5 - Septembre 2023 | 838 |
| 16 | Édition 6 - Septembre 2024 | 786 |
| 18 | Édition 7 - Septembre 2025 | 853 |

Les 4 704 références existent physiquement dans MySQL. Doctrine n’en charge que **4 703**, car la proposition `7-1790` est soft-deleted. Elle reste donc totalement inchangée par la commande.

Une proposition est identifiée par la référence CSV `<proposal_form.reference>-<proposal.reference>`. Les questions de formulaire sont identifiées par la référence du formulaire et leur titre, jamais par un ID de base de données.

## Utilisation

Le mode par défaut est un dry-run :

```bash
bin/console capco:repair:idf-proposals-from-csv /chemin/vers/budget-participatif-ecologique.csv
```

Pour appliquer les modifications :

```bash
bin/console capco:repair:idf-proposals-from-csv /chemin/vers/budget-participatif-ecologique.csv --apply
```

Le séparateur par défaut est `;`. Il peut être remplacé par un caractère unique :

```bash
bin/console capco:repair:idf-proposals-from-csv /chemin/vers/fichier.csv --delimiter=','
```

Le répertoire contenant le CSV doit être inscriptible, car le fichier de log est créé à côté du CSV sous la forme :

```text
<nom-du-csv>.YYYY-MM-DD_HH-mm-ss.log
```

## Déroulement de la commande

La commande effectue deux passages complets sur le fichier.

### Validation du CSV

Avant toute restauration, elle vérifie :

- la présence exacte des 25 colonnes attendues, sans dépendre de leur ordre ;
- les noms de colonnes sans tenir compte de la casse et en acceptant un BOM UTF-8 sur la première colonne ;
- la présence de 25 valeurs sur chaque ligne ;
- le format et l’unicité de chaque référence de proposition ;
- l’appartenance de chaque proposition à l’un des sept formulaires attendus (`2`, `3`, `7`, `11`, `15`, `16` ou `18`) ;
- la lisibilité du fichier et de sa taille.

Les lignes vides sont ignorées. Si une erreur structurelle est trouvée, rien n’est traité et la commande échoue après avoir écrit les erreurs dans le log.

Cette restriction sur les références de formulaire est également vérifiée pendant le traitement. Elle délimite globalement la commande et protège notamment les champs génériques de `Proposal`, qui ne possèdent pas de configuration spécifique par formulaire.

### Traitement

Les lignes sont ensuite traitées par lots de 50. Pour chaque lot :

1. les propositions sont chargées avec leur formulaire ;
2. les réponses cibles existantes sont chargées par titre de question ;
3. les champs et réponses sont mis à jour en mémoire ;
4. en mode `--apply`, le lot est persisté avec un `flush` Doctrine ;
5. l’EntityManager est vidé avant le lot suivant.

Une erreur sur un lot est journalisée pour toutes les lignes du lot, puis la commande poursuit les lots suivants. Il faut donc toujours contrôler le fichier de log, même lorsque la commande se termine avec succès.

En dry-run, aucun `flush` n’est exécuté. Aucune modification de la BDD ou de l’index Elasticsearch n’est conservée.

En mode `--apply`, l’indexation Elasticsearch automatique est désactivée pendant la commande. Après une application ayant modifié des propositions, il faut exécuter séparément :

```bash
bin/console capco:es:populate proposal
```

## Champs de `Proposal` toujours reconstruits

Pour chacune des 4 703 propositions chargées, les quatre champs historiques sont réassignés depuis le CSV, même s’ils possèdent déjà une valeur.

| Colonne CSV | Cible | Règle |
|---|---|---|
| `Nom du projet` | `Proposal.title` | Valeur CSV directe. |
| `Résumé` | `Proposal.summary` | Chaîne vide convertie en `null`, sinon texte limité à 255 caractères. |
| `Description` | `Proposal.body` | Chaîne vide convertie en `null`, sinon paragraphes convertis en HTML. |
| `Adresse du projet`, `LAT`, `LONG`, `geo` | `Proposal.address` | Adresse sérialisée au format attendu par l’entité. |

Pour l’adresse du projet :

- une adresse textuelle vide produit `Proposal.address = null`, même si des coordonnées existent ;
- `LAT` et `LONG` sont prioritaires lorsqu’ils sont tous les deux numériques ;
- sinon, `geo` est utilisé s’il contient deux coordonnées numériques séparées par une virgule ;
- si aucune coordonnée n’est exploitable, seule l’adresse formatée est conservée.

## Champs et relations de `Proposal` restaurés prudemment

Ces données ne sont remplies que lorsque leur cible est absente. Une valeur existante n’est ni comparée ni écrasée et produit une raison dans le log `partial`.

### Estimation

La colonne `Subvention` alimente `Proposal.estimation` uniquement lorsque l’estimation est `null`.

La valeur doit être un nombre positif ou nul composé de chiffres, avec une partie décimale facultative. La virgule décimale est convertie en point. Les valeurs vides, `#N/A` ou tout autre format sont ignorées.

Sur la copie de production analysée, **2 595 estimations** sont restaurables. Les estimations déjà présentes et les valeurs CSV invalides restent inchangées.

### Thématique

La colonne `Thématique` alimente `Proposal.theme` uniquement lorsque cette relation est `null`. `Proposal.category` n’est jamais consultée ni modifiée.

Aucun thème n’est créé. Les six valeurs CSV sont rattachées aux thèmes existants :

| Valeur CSV | Titre du thème en BDD |
|---|---|
| `L'alimentation` | `L'alimentation` |
| `La propreté, les déchets et l'économie circulaire` | Identique |
| `La santé environnementale` | Identique |
| `Vélo et mobilités propres du quotidien` | `Le vélo et mobilités propres du quotidien` |
| `Les énergies renouvelables et l'efficacité énergétique` | Identique |
| `Les espaces verts et la biodiversité` | Identique |

Les apostrophes typographiques sont normalisées avant le rapprochement. Sur la copie analysée, **2 920 thèmes** sont restaurables parmi les 4 703 propositions chargées.

### District

La colonne `Département` alimente `Proposal.district` seulement lorsque :

- le formulaire utilise les districts ;
- la proposition n’a pas encore de district ;
- la valeur commence par un code départemental francilien reconnu ;
- le district correspondant existe dans le même formulaire.

| Code | District recherché |
|---:|---|
| 75 | `Paris (75)` |
| 77 | `Seine-et-Marne (77)` |
| 78 | `Yvelines (78)` |
| 91 | `Essonne (91)` |
| 92 | `Hauts-de-Seine (92)` |
| 93 | `Seine-Saint-Denis (93)` |
| 94 | `Val-de-Marne (94)` |
| 95 | `Val-d'Oise (95)` |

Seuls les formulaires 15, 16 et 18 utilisent les districts. Les valeurs `Île-de-France` et `Interdépartemental` ne correspondent à aucun district et sont ignorées.

Sur la copie analysée, **940 districts** sont restaurables. Les districts existants, dont le conflit connu `18-307`, restent inchangés.

## Réponses de formulaire restaurées

La commande met exclusivement à jour des lignes `ValueResponse` déjà présentes. Elle ne crée ni question, ni choix, ni réponse.

Le marqueur `private` des questions n’est pas un critère d’exclusion : le métier a validé la restauration indépendamment de la visibilité de la question.

Deux marqueurs d’anonymisation sont reconnus :

```text
Contenu supprimé à la demande de son auteur
deleted-content-by-author
```

Selon le type de réponse, certains états vides supplémentaires sont acceptés. Une réponse métier déjà renseignée est toujours conservée.

### Type de projet

La colonne `Type de projet` restaure une réponse à choix unique sur les sept formulaires :

| Formulaires | Question | `Projet local` | `Grand projet` |
|---|---|---|---|
| 2 et 3 | `Je souhaite...` | `Déposer un Projet Local` | `Renseigner la présentation de mon Grand Projet` |
| 7, 11, 15, 16 et 18 | `Téléservice` | `Projet local` | `Grand projet` |

La réponse est modifiée uniquement si elle contient un marqueur d’anonymisation ou un tableau de choix vide de la forme `labels = []` et `other = null`. Une réponse absente ou `null` n’est pas créée ni remplie.

Sur la copie analysée, **2 605 réponses** sont restaurables. Les quatre conflits existants (`2-667`, `2-789`, `2-45` et `3-876`) restent inchangés.

### Zone d’impact

La colonne `Zone d'impact` est restaurée sur les formulaires suivants :

| Formulaire | Question | Format restauré | Restaurables |
|---:|---|---|---:|
| 2 | `Zone d’impact` | Texte CSV direct | 348 |
| 11 | `Zone d’impact du projet` | Choix parmi les cinq libellés autorisés | 292 |
| 15 | `Zone d’impact du projet` | Choix parmi les cinq libellés autorisés | 378 |
| 16 | `Zone d'impact du projet` | Choix parmi les cinq libellés autorisés | 346 |
| 18 | `Zone d'impact du projet` | Choix parmi les cinq libellés autorisés | 237 |
| **Total** | | | **1 601** |

Les cinq choix autorisés sont `Quartier`, `Communal`, `Intercommunal`, `Départemental` et `Régional`.

La valeur CSV doit être non vide. La réponse cible doit être anonymisée ou `null`. Les formulaires 3 et 7 sont volontairement exclus : le premier contient des descriptions géographiques impossibles à convertir sûrement en choix normalisés, et le second ne contient aucune valeur exploitable dans le CSV.

### Structure

La colonne `Structure` restaure une réponse à choix unique. La question cible dépend du formulaire et, pour les formulaires 2 et 3, du `Type de projet` fourni par le CSV.

| Formulaires | Question cible | Mappings acceptés |
|---|---|---|
| 2 et 3 | `Projet Local / Je suis...` ou `Grand Projet / Je suis...` | `Association` → `Une association`, `Entreprise` → `Une entreprise`, `Autre organisme privé` → `Un autre organisme privé`, `Organisme public` → `Un organisme public`. |
| 7 | `Libellé Famille - Bénéficiaire` | `Association`, `Entreprise`, `Organisme public`. |
| 11 | `Libellé Famille - Bénéficiaire` | `Association`, `Entreprise`, `Autre organisme privé`, `Organisme public`. |
| 15 | `Libellé Famille - Bénéficiaire` | `Association` → `Associations`, puis les trois autres libellés du formulaire 11. |
| 16 | `Libellé Famille - Bénéficiaire` | `Association`, `Organisme public`. |
| 18 | `Libellé Famille - Bénéficiaire` | `Association`, `Commune`, `Syndicat de communes ou mixtes`, `Lycée ou collège public (EPLE)` ; `Autre organisme public` → `Organisme public`. |

La réponse est modifiée uniquement si elle est anonymisée ou contient un tableau de choix vide. Les valeurs CSV sans mapping exact sont ignorées. Sur la copie analysée, **2 600 structures** sont restaurables.

### Porteur

La colonne `Porteur` restaure le nom de la structure dans une réponse texte existante.

Pour les formulaires 7, 11, 15, 16 et 18, la question cible est `Nom de votre structure`.

Pour les formulaires 2 et 3 :

- un grand projet utilise `Grand projet / Raison sociale du porteur de projet` ;
- une entreprise ou un autre organisme privé local utilise `Entreprise ou autre orga / Raison sociale` ;
- un organisme public local utilise `Organisme public / Raison sociale` ;
- une association locale utilise toujours `Association sans SIRET sans RNA / Raison sociale`, conformément à la décision métier.

La valeur CSV doit être non vide. En règle générale, seule une réponse anonymisée est remplacée. Pour les associations locales des formulaires 2 et 3, une cible `null` est également restaurable si aucune des trois branches associatives ne contient déjà une valeur non anonymisée.

Sur la copie analysée, **2 600 porteurs** sont restaurables. Les valeurs existantes, les divergences et les branches rendues ambiguës par un conflit restent inchangées.

Cette donnée ne sert jamais à modifier `fos_user`, le nom du compte, son email ou son état de suppression.

### Adresse du siège social

La colonne `Adresse siège social` n’est restaurée que sur les formulaires 2, 3, 11, 16 et 18. Les formulaires 7 et 15 sont volontairement exclus, car le CSV ne permet pas d’y reconstruire les différentes lignes sans inventer une répartition.

| Formulaires | Règle | Restaurables |
|---|---|---:|
| 2 et 3 | Projets locaux uniquement ; question conditionnelle déterminée par `Structure`. Les associations utilisent toujours la branche sans SIRET ni RNA. | 819 |
| 11 | Code postal à cinq chiffres et ville obligatoires ; voie facultative. | 292 |
| 16 | Valeur CSV placée uniquement dans la ligne ville. | 345 |
| 18 | Voie en ligne 3, code postal et ville lorsqu’ils sont détectables ; sinon valeur complète en ligne 3. | 237 |
| **Total** | | **1 693** |

Pour les formulaires à lignes séparées, toutes les réponses attendues doivent exister. Le groupe est restaurable seulement s’il contient au moins une valeur anonymisée ou `null` et aucune valeur métier non vide. La commande vide d’abord toutes les lignes du groupe, puis renseigne les lignes reconstruites afin de ne laisser aucun marqueur d’anonymisation résiduel.

Pour les associations des formulaires 2 et 3, une adresse déjà présente dans l’une des trois branches empêche toute restauration. Pour les autres structures, seule la réponse anonymisée de la branche cible est remplacée.

## Volumes observés sur la copie de production

Les volumes suivants correspondent à la base de production réimportée avant exécution de la commande :

| Donnée | Restaurations identifiées |
|---|---:|
| Champs principaux `title`, `summary`, `body`, `address` | 4 703 propositions traitées |
| Estimation | 2 595 |
| Thème | 2 920 |
| District | 940 |
| Type de projet | 2 605 |
| Zone d’impact | 1 601 |
| Structure | 2 600 |
| Porteur | 2 600 |
| Adresse du siège social | 1 693 |

Ces nombres ne s’additionnent pas : une même proposition peut restaurer plusieurs données. Le compteur final affiché par la commande compte les propositions trouvées et traitées, pas le nombre de champs effectivement modifiés.

## Journalisation

La console affiche uniquement les étapes, les barres de progression, le résumé final et l’avertissement Elasticsearch. Le détail par proposition est écrit exclusivement dans le fichier de log.

Pendant le traitement, chaque ligne de données non vide reçoit un statut :

- `[success]` : la proposition est trouvée et aucune restauration optionnelle n’a produit de raison de skip ;
- `[partial]` : les champs principaux sont traités, mais au moins une restauration optionnelle a été ignorée ;
- `[error]` : proposition introuvable, erreur de validation ou échec du lot.

Un statut `partial` ne signifie donc pas que `title`, `summary`, `body` ou `address` ont échoué. Il indique seulement qu’au moins l’une des restaurations suivantes n’a pas été faite : estimation, district, thème, type de projet, zone d’impact, structure, porteur ou adresse du siège social.

Les raisons sont concaténées sur une seule entrée. Exemple :

```text
row: 42 reference: 18-307 [partial] reason: Estimation skipped (already set, conflict or invalid CSV value). District skipped (already set, conflict or invalid CSV value).
```

Le district n’est pas considéré comme ignoré lorsque le formulaire n’utilise pas cette fonctionnalité : dans ce cas, aucune raison `District skipped` n’est ajoutée.

À l’inverse, une zone d’impact sur les formulaires 3 ou 7 et une adresse de siège social sur les formulaires 7 ou 15 produisent bien une raison de skip : ces méthodes sont appelées, mais ces formulaires sont volontairement absents de leur configuration de restauration.

## Données volontairement non restaurées

| Donnée ou colonne CSV | Décision finale |
|---|---|
| `Proposal.category` | La catégorie représente la thématique secondaire. Elle n’est ni lue ni modifiée. |
| `Visuel`, `url_image`, `Proposal.media` | Illustrations explicitement hors périmètre selon la décision métier finale. |
| `Date` | Ne correspond pas de façon fiable à la date de création individuelle. |
| `Édition` | Déjà portée par le formulaire identifié dans la référence. |
| `Nbr votes` | Un agrégat ne permet pas de recréer les votes individuels et leurs contraintes d’unicité. |
| `Commune` | Aucune cible métier dédiée ; l’information peut déjà apparaître dans les adresses. |
| `Code action`, `Intitulé action budgétaire` | Aucune table ou question existante sémantiquement correcte. |
| `Lien` | Ancienne URL SmartIDF dérivée du projet et de son slug. |
| Comptes `fos_user` | L’anonymisation des auteurs reste intacte. Aucun compte n’est réactivé ou réidentifié. |

Ces colonnes restent obligatoires dans la structure du CSV, car la validation attend l’export historique complet, mais elles ne participent pas à la restauration.

## Contrôles réalisés

- lecture complète des 4 704 lignes avec le BOM UTF-8, le séparateur `;` et les retours à la ligne internes aux champs ;
- comparaison des données avec les entités `Proposal`, `Theme`, `ProposalDistrict`, les questions, les choix et les `ValueResponse` existants ;
- vérification que les questions sont résolues par référence de formulaire et titre, sans ID technique codé en dur ;
- exécution en dry-run sur la copie de production réimportée ;
- validation PHPStan de la commande finale.
