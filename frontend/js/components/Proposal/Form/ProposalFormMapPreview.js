// @flow
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import { useSelector } from 'react-redux';
import config from '~/config';
import type { MapTokens } from '~/redux/modules/user';
import type { GlobalState } from '~/types';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import { MAX_MAP_ZOOM } from '~/utils/styles/variables';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import { colors as dsColors } from '~/styles/modules/colors';
import { colors } from '~/utils/colors';
import type { MapProps } from '~/components/Proposal/Map/Map.types';
import type { AddressComplete } from '~/components/Form/Address/Address.type';

type Props = {|
  +address: ?string,
  +category: ?string,
  +categories: $ReadOnlyArray<{| +id: string, +name: string, +color: string, +icon: ?string |}>,
|};

let L;

export const ProposalFormMapPreview = ({ address, category, categories }: Props) => {
  const mapTokens: MapTokens = useSelector((state: GlobalState) => state.user.mapTokens);
  const mapRef = React.useRef(null);
  const proposalAddress: AddressComplete = JSON.parse(
    address ? address.substring(1, address.length - 1) : '{}',
  );

  React.useEffect(() => {
    if (config.canUseDOM) {
      L = require('leaflet'); // eslint-disable-line
      L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);
    }
  }, []);

  React.useEffect(() => {
    if (mapRef.current && proposalAddress?.geometry)
      mapRef.current.setView([
        proposalAddress.geometry.location.lat,
        proposalAddress.geometry.location.lng,
      ]);
  }, [proposalAddress]);

  if (!mapTokens || !L || !address) return null;

  const { publicToken, styleId, styleOwner } = mapTokens.MAPBOX;
  const proposalCategory = categories.find(cat => cat.id === category) || {
    color: dsColors.blue[500],
  };
  return (
    <MapContainer
      whenCreated={(map: MapProps) => {
        mapRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
      }}
      doubleClickZoom={false}
      dragging={false}
      touchZoom={false}
      scrollWheelZoom={false}
      zoom={16}
      zoomControl={false}
      center={proposalAddress.geometry.location}
      maxZoom={MAX_MAP_ZOOM}
      css={{
        width: '100%',
        height: 200,
        marginBottom: 12,
        '.leaflet-control-attribution.leaflet-control': {
          display: 'none',
        },
      }}
      tap={!L.Browser.mobile}
      gestureHandling>
      <TileLayer
        attribution='&copy; <a href"https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href"https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
        url={`https://api.mapbox.com/styles/v1/${styleOwner}/${styleId}/tiles/256/{z}/{x}/{y}?access_token=${publicToken}`}
      />
      <Marker
        position={[proposalAddress.geometry.location.lat, proposalAddress.geometry.location.lng]}
        icon={L.divIcon({
          className: 'preview-icn',
          html: renderToString(
            <>
              <Icon name={ICON_NAME.pin3} size={40} color={proposalCategory.color} />
              {proposalCategory.icon && (
                <Icon
                  name={ICON_NAME[proposalCategory.icon]}
                  size={16}
                  color={colors.white}
                  style={{
                    position: 'absolute',
                    top: 7,
                    left: 12,
                  }}
                />
              )}
            </>,
          ),
          iconSize: [34, 48],
          iconAnchor: [17, 24],
        })}
      />
    </MapContainer>
  );
};
