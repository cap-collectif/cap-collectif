// @flow
import React, { useRef, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { Marker, MapContainer as Map } from 'react-leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import { graphql, usePaginationFragment, type GraphQLTaggedNode } from 'react-relay';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import type { MapProps, MapCenterObject } from '~/components/Proposal/Map/Map.types';
import type { VoteStepMap_step$key } from '~relay/VoteStepMap_step.graphql';
import { isSafari } from '~/config';
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer';
import { MapContainer } from './Map.style';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import { MAX_MAP_ZOOM } from '~/utils/styles/variables';
import LocateAndZoomControl from './LocateAndZoomControl';
import ProposalMapLoaderPane from '~/components/Proposal/Map/ProposalMapLoaderPane';
import useIsMobile from '~/utils/hooks/useIsMobile';

type Props = {|
  +voteStep: VoteStepMap_step$key,
  +handleMapPositionChange: string => void,
  +defaultCenter: MapCenterObject | null,
|};

const FRAGMENT: GraphQLTaggedNode = graphql`
  fragment VoteStepMap_step on SelectionStep
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" })
  @refetchable(queryName: "VoteStepMapPaginationQuery") {
    proposals(first: $count, after: $cursor)
      @connection(key: "VoteStepMap_proposals", filters: ["query", "orderBy"]) {
      edges {
        node {
          id
          address {
            lat
            lng
          }
          category {
            color
            icon
          }
        }
      }
    }
  }
`;

const DEFAULT_CENTER = { lat: 48.8586047, lng: 2.3137325 };
const ICON_COLOR = '#5E5E5E';

export const VoteStepMap = ({ voteStep, handleMapPositionChange, defaultCenter }: Props) => {
  const mapRef = useRef(null);
  const isMobile = useIsMobile();

  const { data, loadNext, hasNext, refetch, isLoadingNext } = usePaginationFragment(
    FRAGMENT,
    voteStep,
  );

  const markers =
    data.proposals.edges
      ?.map(edge => edge?.node)
      .filter(Boolean)
      .filter(proposal => !!(proposal?.address && proposal.address.lat && proposal.address.lng)) ||
    [];

  useEffect(() => {
    L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);
  }, []);

  useEffect(() => {
    if (hasNext) {
      loadNext(50);
    }
  }, [hasNext, isLoadingNext, loadNext]);

  return (
    <MapContainer>
      <Map
        whenCreated={(map: MapProps) => {
          mapRef.current = map;
          map.on('moveend', () => {
            if (mapRef.current) handleMapPositionChange(JSON.stringify(mapRef.current.getCenter()));
          });
        }}
        center={defaultCenter || DEFAULT_CENTER}
        zoom={12}
        maxZoom={MAX_MAP_ZOOM}
        style={{
          height: 'calc(100vh - 130px)',
          width: isMobile ? '100vw' : '100%',
          zIndex: 0,
        }}
        zoomControl={false}
        dragging
        tap={false}
        doubleClickZoom={isMobile}
        gestureHandling={!isSafari}>
        <CapcoTileLayer />
        <MarkerClusterGroup
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          zoomToBoundsOnClick
          spiderfyDistanceMultiplier={4}
          maxClusterRadius={30}>
          {markers?.length > 0 &&
            markers.map((mark, idx) => {
              const size = 48;
              const icon = mark.category?.icon;
              let delay;
              return (
                <Marker
                  key={idx}
                  position={[mark.address?.lat, mark.address?.lng]}
                  icon={L.divIcon({
                    className: 'preview-icn',
                    html: renderToString(
                      <>
                        <Icon name={ICON_NAME.pin3} size={size} color={ICON_COLOR} />
                        {icon && <Icon name={ICON_NAME[icon]} size={19} color="white" />}
                      </>,
                    ),
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size],
                    popupAnchor: [0, -size],
                  })}
                  eventHandlers={{
                    mouseover: () => {
                      delay = setTimeout(() => {
                        // eslint-disable-next-line no-undef
                        const event = new MessageEvent('hover-proposal', {
                          bubbles: true,
                          data: { id: mark.id },
                        });
                        document.dispatchEvent(event);
                      }, 200);
                    },
                    mouseout: () => clearTimeout(delay),
                  }}
                />
              );
            })}
        </MarkerClusterGroup>
        {!isMobile ? <LocateAndZoomControl /> : null}
        {hasNext && (
          <ProposalMapLoaderPane
            hasError={false}
            retry={() => {
              refetch({});
            }}
          />
        )}
      </Map>
    </MapContainer>
  );
};

export default VoteStepMap;
