# ADR 001 - Migration de la stack carto de Mapbox vers MapLibre/OpenStreetMap

## Contexte

La plateforme utilisait historiquement Mapbox avec une chaîne technique complète:
- gestion de tokens et styles Mapbox en base (`MapToken`)
- API GraphQL interne dédiée (`mapToken`, `mapTokens`, mutations de configuration)
- UI d'administration dédiée à la configuration Mapbox
- variables d'environnement et commandes de bootstrap associées

Cette migration est motivée par trois raisons principales:
- les coûts élevés de Mapbox
- une forte demande client pour des outils européens
- la volonté de simplifier le code et la maintenance de la stack carto

Dans le cadre de la branche `18678-maj-carto-v2` (PR #19424), nous remplaçons donc la stack Mapbox pour répondre à ces enjeux.

Note historique: aucun ADR existant ne documentait le choix Mapbox auparavant. Cet ADR est donc une nouvelle décision, pas une révision d'un ADR carto existant.

## Décision

Nous adoptons une stack cartographique basée sur:
- **MapLibre GL** côté rendu
- un **style versionné dans le repo** (`public/map-style.json`)
- des tuiles/sources **OpenStreetMap via OpenFreeMap/OpenMapTiles**

En conséquence:
- suppression de la chaîne Mapbox (entité `MapToken`, resolvers/mutations/types GraphQL, UI admin Mapbox, commandes de génération de token, variables d'env associées)
- migration des couches de rendu front et admin-next vers `L.maplibreGL({ style: '/map-style.json' })`
- ajout de mocks/tests Jest dédiés pour fiabiliser le wiring MapLibre/Leaflet

## Alternatives considérées

### Fonds de carte

- Mapbox (outils précédant) : écarté pour des raisons de coût.
- Stadia Maps : envisagé mais payant, avec un modèle tarifaire similaire à Mapbox.
- OpenFreeMap / OpenMapTiles : retenu — gratuit, basé sur OpenStreetMap, compatible avec les styles MapLibre.

### Moteur de rendu

- Leaflet (moteur précédant) : maintenu comme couche d'intégration React via leaflet.maplibre-gl, mais plus utilisé directement pour le rendu vectoriel.
- MapLibre GL JS : retenu — fork open-source de Mapbox GL JS, sans licence propriétaire, avec support natif des styles vectoriels et des tuiles OpenMapTiles.

## Conséquences

- ✅ Simplification de l'architecture (suppression d'une verticale MapToken complète)
- ✅ Suppression des frais Mapbox
- ✅ Moins de configuration sensible à maintenir (tokens/env/boot)
- ✅ Style carto centralisé et versionné dans le code
- ⚠️ Breaking changes API interne: suppression des queries/mutations/types `MapToken*`
- ⚠️ Nécessité de valider les parcours cartes front/admin en recette (affichage, interactions, performances)
- ⚠️ Responsabilité de maintenance du style carto déplacée côté application (`public/map-style.json`)
- ⚠️ Dépendance à la stabilité des serveurs gratuits de Open Street Maps

## Statut

Validé

## Références

- Issue: #18678
- PR: #19424
- Fichier de style: `public/map-style.json`
