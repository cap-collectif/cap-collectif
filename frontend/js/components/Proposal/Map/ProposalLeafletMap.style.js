// @flow
import styled, { type StyledComponent } from 'styled-components';
import { Map, Popup } from 'react-leaflet';
import Slider from 'react-slick';
import colors from '~/utils/colors';
import { mediaQueryMobile } from '~/utils/sizes';

export const CLOSED_MARKER_SIZE = 40;
export const OPENED_MARKER_SIZE = 42;
export const CLOSED_MARKER = '/svg/marker-not-selected.svg';
export const OPENED_MARKER = '/svg/marker.svg';

// A lot of classes here but that's just leaflet ones

export const BlankPopup: StyledComponent<{}, {}, typeof Popup> = styled(Popup)`
  .leaflet-popup-content {
    margin: 0;
    width: 280px !important;
  }

  .leaflet-popup-content-wrapper {
    border-radius: 4px;
  }
`;

export const StyledMap: StyledComponent<{}, {}, typeof Map> = styled(Map)`
  width: '100%';

  .leaflet-control-attribution.leaflet-control {
    display: none;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .leaflet-popup {
      display: none;
    }
  }

  .leaflet-control-locate-location circle {
    fill: ${colors.black};
    animation: leaflet-control-locate-throb 3s infinite cubic-bezier(0.36, 0.11, 0.89, 0.32);
  }

  @keyframes leaflet-control-locate-throb {
    from {
      transform: scale(0.5, 0.5);
      opacity: 0.5;
    }
    to {
      transform: scale(2.5, 2.5);
      opacity: 0;
    }
  }
`;

// I am hard-positioning the Slider onto the map, to allow 1-finger navigation, see https://github.com/Leaflet/Leaflet/issues/5425
export const SliderPane: StyledComponent<{}, {}, typeof Slider> = styled(Slider)`
  margin-top: -160px;
`;

export const locationMarkerCode = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" version="1.1" viewBox="-24 -24 48 48">
<circle id="circle1" r="7" style="animation-delay: -3s" />
<circle id="circle2" r="7" style="animation-delay: -2s"/>
<circle id="circle3" r="7" style="animation-delay: -1s"/>
<circle id="circle4" r="7" style="animation-delay: -0s"/>
</svg>`;
