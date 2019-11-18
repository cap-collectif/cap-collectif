# Principaux concepts de Draft.js

Cette documentation sert à cerner les principaux concepts de Draft.js, la documentation n'étant pas forcément très claire et les articles peu nombreux à ce sujet.

## EditorState

### ContentState
Le contenu de l'éditeur, matérialisé par le `ContentState`, est une liste de `ContentBlock`. Concrètement, il contient un `OrderedMap` (de la bibliothèque `ImmutableJS`) contenant tous les `ContentBlock` à l'intérieur de l'éditeur.

Chaque `ContentBlock` est un `Record` d'ImmutableJS chargé de décrire toutes les informations à propos du block.
* `key`: chaîne de caractère permettant d'identifier de façon unique le block
* `type`: permet d'indiquer comment le block sera rendu (par exemple, les blocks avec un type `unstyled` seront rendu comme des tags `<p>` tags; les blocks avec un type `header-one` comme des tags `<h1>`
* `text`: le texte entier contenu dans le block
* `characterList`: `List` d'ImmutableJS contenant autant d'éléments que le nombre de caractères de `text`. Chaque élément sert donc à décrire quels styles et quelles entités s'appliquent pour chaque caractère du block.

Pour débugger le `ContentState` :
```js
console.log(convertToRaw(editorState.getCurrentContent()))
```

Voir https://draftjs.org/docs/api-reference-content-state

### SelectionState
Le `SelectionState` représente l'état de la sélection courant de l'éditeur à un instant T.

Il contient entre autre :
* les offsets de début et de fin
* les clés des blocks de début et de fin
* la direction de la sélection
* l'état du focus

Pour débugger le `ContentState` :
```js
console.log(editorState.getSelection().toJS())
```

Voir https://draftjs.org/docs/api-reference-selection-state

## Entities

Les `Entities` sont des `Maps` d'ImmutableJS servant à stocker la metadata de certains caractères.

Ils contiennent :
* `data` : totalement libre
* `mutability` : décrit le comportement d'édition de l'entité, 3 types sont possibles :
  * `MUTABLE` : le texte peut être altéré librement sans supprimer l'entité appliquée
  * `IMMUTABLE` : l'édition du texte supprime automatiquement l'entité appliquée
  * `SEGMENTED` : est un entre deux entre les types précédents
* `type` : permet d'identifier l'entité

Voir https://draftjs.org/docs/advanced-topics-entities

## Customisation

* `blockRenderMap` : block type -> html tag
* `blockRendererFn` : permet de définir de quelle façon sont rendus les blocks custom
* `blockStyleFn` : permet de définir les `className` à appliquer aux blocks
* `customStyleMap`: type -> style
* `customStyleFn`

# Architectures du composant

```sh
AdminEditor/
├── components/ # contient les composants React réutilisables
├── encoder/
│   ├── exportHTML.js # décrit la config d'export HTML
│   └── importHTML.js # décrit la config d'import HTML
├── hooks/ # contient les hooks réutilisables
├── models/ # contient les types Flow
├── plugins/ # contient le code externe
├── renderer/ # contient les blocks Draft.js custom
├── toolbar/ # contient les composants React de la toolbar
├── colors.js # contient la config des couleurs
├── context.js # contient le context React de l'éditeur
├── decorators.js # contient la config des décorateurs Draft.js
├── index.js/ # point d'entrée du composant permettant le feature flag
├── utils.js/ # contient les utils réutilisables
```
