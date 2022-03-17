// @flow
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import styled, { type StyledComponent } from 'styled-components';
import { MapContainer, Marker } from 'react-leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';
import config from '~/config';
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';

let L;

type Props = {|
  +color: string,
  +icon: string,
|};

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  max-height: 128px;
  min-height: 115px;
  position: relative;
  width: 49%;
  ${MAIN_BORDER_RADIUS};
  border: 1px solid #e3e3e3;

  .preview-icn svg:nth-child(2) {
    position: absolute;
    top: 7px;
    left: 12px;
  }

  .leaflet-bottom.leaflet-right {
    display: none;
  }
`;

export const ProposalFormCategoryPinPreview = ({ color, icon }: Props) => {
  React.useEffect(() => {
    if (config.canUseDOM) {
      L = require('leaflet'); // eslint-disable-line
      L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);
    }
  }, []);

  if (config.canUseDOM) {
    L = require('leaflet'); // eslint-disable-line
  }
  return (
    <Container>
      <MapContainer
        center={{
          lat: 48.8604,
          lng: 2.3507,
        }}
        doubleClickZoom={false}
        dragging={false}
        touchZoom={false}
        scrollWheelZoom={false}
        zoom={16}
        zoomControl={false}
        style={{
          width: '100%',
          height: '100%',
        }}
        gestureHandling>
        <CapcoTileLayer />
        <Marker
          position={[48.8601, 2.3507]}
          icon={L.divIcon({
            className: 'preview-icn',
            html: renderToString(
              <>
                <Icon name={ICON_NAME.pin3} size={40} color={color} />
                {icon && <Icon name={ICON_NAME[icon]} size={16} color={colors.white} />}
              </>,
            ),
            iconSize: [34, 48],
            iconAnchor: [17, 48],
          })}
        />
      </MapContainer>
    </Container>
  );
};

export default ProposalFormCategoryPinPreview;
