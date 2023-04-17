// @flow
import styled, { type StyledComponent } from 'styled-components';

export const MapContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  position: relative;

  .marker-cluster-small {
    background: rgba(41, 144, 51, 0.3);
  }
  .marker-cluster-small div {
    background: #299033;
  }

  .location-circle circle {
    animation: leaflet-control-locate-throb 2s infinite cubic-bezier(0.36, 0.11, 0.89, 0.32);
  }

  .leaflet-control-attribution.leaflet-control {
    display: none;
  }

  @keyframes leaflet-control-locate-throb {
    from {
      transform: scale(0.75, 0.75);
      opacity: 0.5;
    }
    to {
      transform: scale(2, 2);
      opacity: 0;
    }
  }

  .preview-icn svg:nth-child(2) {
    position: absolute;
    top: 7px;
    left: 14px;
    pointer-events: none;
  }

  .leaflet-marker-icon svg:first-child:hover {
    fill: #e97657;
  }

  /**
    Leaflet doesn't allow to natively center elements 
    https://github.com/Leaflet/Leaflet/issues/8358
  **/
  .leaflet-bottom.leaflet-left {
    left: 50%;
    transform: translate(-50%, 0%);
  }
`;
