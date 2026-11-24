---
name: cartography
description: Implemente des cartes interactives avec Leaflet et react-leaflet. Couvre markers, clusters, popups, geolocalisation, fond de carte MapLibre/OpenStreetMap et accessibilite.
---

# Cartographie / Maps

Guide pour implementer des cartes interactives dans `admin-next/` avec Leaflet, react-leaflet et MapLibre (fond de carte OpenStreetMap).

## Stack technique

- **leaflet** : 1.9.4 - Librairie de cartographie
- **react-leaflet** : 4.2.1 - Binding React pour Leaflet
- **react-leaflet-markercluster** : Clustering de markers
- **MapLibre GL** (via `@maplibre/maplibre-gl-leaflet`) : fond de carte vectoriel OpenStreetMap/OpenFreeMap,
  style versionne dans `public/map-style.json`. Mapbox a ete retire : voir `ADR/001-map_stack_maplibre_openstreetmap.md`

## Structure recommandee

```
components/
└── MyFeature/
    └── Map/
        ├── MyFeatureMap.tsx           # Wrapper avec Suspense
        ├── MyFeatureMapContainer.tsx  # MapContainer + logique
        ├── MyFeatureMapMarkers.tsx    # Markers avec pagination
        ├── MyFeatureMarker.tsx        # Marker individuel
        └── MapControls.tsx            # Controles custom
```

## Composant Map de base

```typescript
// MyFeatureMap.tsx
import { Suspense } from 'react'
import { Spinner, Box } from '@cap-collectif/ui'
import dynamic from 'next/dynamic'

// IMPORTANT: Leaflet ne supporte pas le SSR
const MyFeatureMapContainer = dynamic(
  () => import('./MyFeatureMapContainer'),
  { ssr: false }
)

type Props = {
  query: MyFeatureMap_query$key
}

export const MyFeatureMap: React.FC<Props> = ({ query }) => {
  return (
    <Box height="500px" width="100%" position="relative">
      <Suspense fallback={<MapSkeleton />}>
        <MyFeatureMapContainer query={query} />
      </Suspense>
    </Box>
  )
}

const MapSkeleton = () => (
  <Box
    height="100%"
    width="100%"
    bg="gray.100"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <Spinner />
  </Box>
)
```

## MapContainer

```typescript
// MyFeatureMapContainer.tsx
import 'leaflet/dist/leaflet.css'
import type L from 'leaflet'
import { MapContainer, useMapEvents } from 'react-leaflet'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { CapcoTileLayer } from '@utils/leaflet'

const FRAGMENT = graphql`
  fragment MyFeatureMapContainer_query on Query
  @argumentDefinitions(
    bounds: { type: "String" }
    # ... autres filtres
  ) {
    ...MyFeatureMapMarkers_query @arguments(bounds: $bounds)
  }
`

const DEFAULT_CENTER: [number, number] = [46.603354, 1.888334] // France
const DEFAULT_ZOOM = 6
const MAX_ZOOM = 18

type Props = {
  query: MyFeatureMapContainer_query$key
}

export const MyFeatureMapContainer: React.FC<Props> = ({ query: queryRef }) => {
  const data = useFragment(FRAGMENT, queryRef)
  const intl = useIntl()
  const mapLabel = intl.formatMessage({ id: 'global.card' })
  // Leaflet makes the container focusable (keyboard panning): give it a name
  const onMapReady = React.useCallback(
    (map: L.Map | null) => {
      if (!map) return
      map.getContainer().setAttribute('role', 'region')
      map.getContainer().setAttribute('aria-label', mapLabel)
    },
    [mapLabel],
  )

  return (
    <MapContainer
      ref={onMapReady}
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      maxZoom={MAX_ZOOM}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={false} // On utilise des controles custom
    >
      <CapcoTileLayer />
      <MapEventHandler />
      <MyFeatureMapMarkers query={data} />
      <MapControls />
    </MapContainer>
  )
}

// Hook pour ecouter les events de la map
const MapEventHandler: React.FC = () => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds()
      const boundsString = `${bounds.getSouthWest().lat},${bounds.getSouthWest().lng},${bounds.getNorthEast().lat},${bounds.getNorthEast().lng}`
      // Mettre a jour les filtres URL
    },
    zoomend: () => {
      // Logique au changement de zoom
    },
  })

  return null
}
```

## Markers avec clustering

```typescript
// MyFeatureMapMarkers.tsx
import { Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { graphql, usePaginationFragment } from 'react-relay'
import L from 'leaflet'

const FRAGMENT = graphql`
  fragment MyFeatureMapMarkers_query on Query
  @argumentDefinitions(
    count: { type: "Int!", defaultValue: 100 }
    cursor: { type: "String" }
    bounds: { type: "String" }
  )
  @refetchable(queryName: "MyFeatureMapMarkersPaginationQuery") {
    items(first: $count, after: $cursor, bounds: $bounds)
      @connection(key: "MyFeatureMapMarkers_items") {
      edges {
        node {
          id
          title
          address {
            lat
            lng
          }
        }
      }
    }
  }
`

// Configuration du clustering
const CLUSTER_OPTIONS = {
  spiderfyOnMaxZoom: true,
  zoomToBoundsOnClick: true,
  maxClusterRadius: 30,
  spiderfyDistanceMultiplier: 4,
  showCoverageOnHover: false,
}

export const MyFeatureMapMarkers: React.FC<Props> = ({ query: queryRef }) => {
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, queryRef)

  // Charger plus de markers si necessaire
  React.useEffect(() => {
    if (hasNext) {
      loadNext(100)
    }
  }, [hasNext, loadNext])

  const markers = data.items.edges
    .map(edge => edge.node)
    .filter(node => node.address?.lat && node.address?.lng)

  return (
    <MarkerClusterGroup {...CLUSTER_OPTIONS}>
      {markers.map(item => (
        <MyFeatureMarker key={item.id} item={item} />
      ))}
    </MarkerClusterGroup>
  )
}
```

## Marker custom avec icone

```typescript
// MyFeatureMarker.tsx
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { renderToString } from 'react-dom/server'
import { Icon, CapUIIcon } from '@cap-collectif/ui'

type Props = {
  item: {
    id: string
    title: string
    address: { lat: number; lng: number }
    category?: { color: string; icon?: string } | null
  }
}

export const MyFeatureMarker: React.FC<Props> = ({ item }) => {
  const { address, category } = item
  const markerRef = React.useRef<L.Marker>(null)

  // Creer une icone custom avec React
  const icon = React.useMemo(() => {
    const color = category?.color ?? '#1E88E5'

    return L.divIcon({
      className: 'custom-marker', // Important: evite les styles par defaut
      html: renderToString(
        <div style={{ position: 'relative' }}>
          <Icon
            name={CapUIIcon.Pin}
            size="xl"
            color={color}
          />
          {/* Accessible name of the marker, which Leaflet exposes as a button */}
          <span className="sr-only">{item.title}</span>
        </div>
      ),
      iconSize: [30, 40],
      iconAnchor: [15, 40], // Point d'ancrage en bas au centre
      popupAnchor: [0, -40], // Popup au-dessus du marker
    })
  }, [category?.color, item.title])

  return (
    <Marker
      position={[address.lat, address.lng]}
      icon={icon}
      ref={markerRef}
      eventHandlers={{
        click: () => {
          // Analytics, navigation, etc.
        },
        // Leaflet exposes markers as buttons but does not turn Enter or Space into a click
        keypress: (event: L.LeafletKeyboardEvent) => {
          if (event.originalEvent.key !== 'Enter' && event.originalEvent.key !== ' ') return
          event.originalEvent.preventDefault()
          markerRef.current?.openPopup()
        },
      }}
    >
      <Popup>
        <MarkerPopupContent item={item} />
      </Popup>
    </Marker>
  )
}

const MarkerPopupContent: React.FC<{ item: Props['item'] }> = ({ item }) => (
  <div style={{ minWidth: 200 }}>
    <strong>{item.title}</strong>
    {/* Contenu du popup */}
  </div>
)
```

## Controles custom

```typescript
// MapControls.tsx
import { useMap } from 'react-leaflet'
import { Flex, Button, Icon, CapUIIcon } from '@cap-collectif/ui'

export const MapControls: React.FC = () => {
  const map = useMap()

  const handleZoomIn = () => map.zoomIn()
  const handleZoomOut = () => map.zoomOut()

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 })
  }

  return (
    <Flex
      direction="column"
      position="absolute"
      top={4}
      right={4}
      zIndex={1000}
      gap={2}
    >
      <Button
        variant="secondary"
        size="small"
        onClick={handleLocate}
        aria-label="Ma position"
      >
        <Icon name={CapUIIcon.Location} />
      </Button>
      <Button
        variant="secondary"
        size="small"
        onClick={handleZoomIn}
        aria-label="Zoom avant"
      >
        <Icon name={CapUIIcon.Add} />
      </Button>
      <Button
        variant="secondary"
        size="small"
        onClick={handleZoomOut}
        aria-label="Zoom arriere"
      >
        <Icon name={CapUIIcon.Remove} />
      </Button>
    </Flex>
  )
}
```

## Geolocalisation et recherche d'adresse

```typescript
import { useMap } from 'react-leaflet'

// Hook pour gerer la geolocalisation
const useGeolocation = () => {
  const map = useMap()
  const [isLocating, setIsLocating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const locate = React.useCallback(() => {
    setIsLocating(true)
    setError(null)

    map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true,
    })

    map.once('locationfound', (e) => {
      setIsLocating(false)
      // e.latlng contient la position
    })

    map.once('locationerror', (e) => {
      setIsLocating(false)
      setError(e.message)
    })
  }, [map])

  return { locate, isLocating, error }
}
```

## Synchronisation URL (filtres geographiques)

```typescript
import { parseAsString, useQueryState } from 'nuqs'
import { useMap, useMapEvents } from 'react-leaflet'

const MapUrlSync: React.FC = () => {
  const map = useMap()
  const [bounds, setBounds] = useQueryState('bounds')
  const [center, setCenter] = useQueryState('center')

  // Mettre a jour l'URL quand la map bouge
  useMapEvents({
    moveend: () => {
      const mapBounds = map.getBounds()
      const boundsStr = [
        mapBounds.getSouth(),
        mapBounds.getWest(),
        mapBounds.getNorth(),
        mapBounds.getEast(),
      ].join(',')
      setBounds(boundsStr)

      const mapCenter = map.getCenter()
      setCenter(`${mapCenter.lat},${mapCenter.lng}`)
    },
  })

  // Restaurer la vue depuis l'URL au chargement
  React.useEffect(() => {
    if (center) {
      const [lat, lng] = center.split(',').map(Number)
      if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], map.getZoom())
      }
    }
  }, []) // Seulement au montage

  return null
}
```

## Bonnes pratiques

### Performance

1. **Limiter le nombre de markers** : Utiliser la pagination Relay et charger par lots
2. **Clustering obligatoire** : Toujours utiliser MarkerClusterGroup pour > 50 markers
3. **Lazy loading** : Charger les markers seulement dans les bounds visibles
4. **Memoization** : `useMemo` pour les icones custom (evite les re-renders)

### Accessibilite

Leaflet rend chaque marker focusable et l'expose comme un bouton (`keyboard: true` par defaut),
meme sans action. Son nom vient de `title`, ou de `alt` pour une icone `<img>` seulement :
avec `L.divIcon`, un marker sans nom est lu « bouton ».

1. **Marker avec action** (popup, selection) : le nommer avec un texte masque dans le `html` du
   `divIcon` (`<span className="sr-only">{titre}</span>`), et gerer Entree/Espace via l'evenement
   `keypress` : Leaflet ne les transforme pas en clic. Exemple : ProposalMarker.tsx.
2. **Marker sans action** (simple reperage) : `keyboard={false}`, qui retire le role et la tabulation
   (`interactive={false}` seul ne le fait pas). Ajouter `interactive={false}` seulement si la carte ne
   reagit pas au clic : un marker non interactif laisse passer les clics vers la carte (sur
   LocateOnMapModal.tsx, cela deplacerait la position choisie). Exemple : AddressMapPreview.tsx.
3. **Conteneur de carte** : Leaflet le rend focusable (deplacement aux fleches).
   - Carte outil : lui donner un nom via `ref` (`role="region"` + `aria-label`, cle `global.card`),
     comme VoteStepMapContainer.tsx et LocateOnMapModal.tsx.
   - Apercu purement visuel dont l'information existe en texte : `keyboard={false}` sur `MapContainer`.
4. **Fond de carte** : toujours passer par `CapcoTileLayer`. Il masque le canvas MapLibre (« Map »
   en anglais) et retire le titre anglais du lien d'attribution « Leaflet ».
5. **Champ superpose a la carte** (recherche d'adresse) : un vrai `<label>` (`sr-only` si besoin),
   pas seulement un placeholder.
6. **Labels ARIA** sur tous les boutons de controle.
7. **Popups** accessibles au clavier (voir point 1).

### SSR / Hydration

```typescript
// TOUJOURS utiliser dynamic import avec ssr: false
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})
```

### Gestion des erreurs

```typescript
const MapWithErrorBoundary: React.FC<Props> = (props) => (
  <ErrorBoundary
    fallback={
      <Box p="lg" bg="gray.100" textAlign="center">
        <Text>Impossible de charger la carte</Text>
        <Button onClick={() => window.location.reload()}>
          Reessayer
        </Button>
      </Box>
    }
  >
    <MyFeatureMap {...props} />
  </ErrorBoundary>
)
```

## Utilitaires disponibles

```typescript
// admin-next/utils/leaflet.tsx

// Fond de carte MapLibre (style public/map-style.json), deja accessible : canvas masque aux
// lecteurs d'ecran, lien d'attribution « Leaflet » sans titre anglais
import { CapcoTileLayer } from '@utils/leaflet'

// Parser les coordonnees depuis l'URL
import { parseLatLng, parseLatLngBounds } from '@utils/leaflet'

// Formater les GeoJSON avec styles
import { formatGeoJsons, convertToGeoJsonStyle } from '@utils/leaflet'
```

## Exemples du projet

- Map complete : [VoteStepMapContainer.tsx](admin-next/components/FrontOffice/Steps/VoteStep/Map/VoteStepMapContainer.tsx)
- Markers avec clustering : [VoteStepMapMarkers.tsx](admin-next/components/FrontOffice/Steps/VoteStep/Map/VoteStepMapMarkers.tsx)
- Marker custom : [ProposalMarker.tsx](admin-next/components/FrontOffice/Steps/VoteStep/Map/ProposalMarker.tsx)
- Apercu non interactif : [AddressMapPreview.tsx](admin-next/components/FrontOffice/Steps/VoteStep/ProposalForm/Inputs/AddressMapPreview.tsx)
- Controles : [LocateAndZoomControl.tsx](admin-next/components/FrontOffice/Leaflet/LocateAndZoomControl.tsx)

## Checklist

- [ ] Import dynamique avec `ssr: false`
- [ ] `leaflet/dist/leaflet.css` importe
- [ ] MarkerClusterGroup pour les listes de markers
- [ ] Icones custom avec `L.divIcon` et `className: 'custom-marker'`
- [ ] Markers nommes (texte `sr-only` + Entree/Espace), ou `keyboard={false}` sans action
- [ ] Conteneur de carte nomme (`role="region"` + `aria-label`), ou retire du clavier s'il est purement visuel
- [ ] Fond de carte via `CapcoTileLayer`
- [ ] Controles avec labels ARIA
- [ ] Gestion des erreurs (ErrorBoundary)
- [ ] Pagination Relay pour les markers
- [ ] Synchronisation URL si necessaire
