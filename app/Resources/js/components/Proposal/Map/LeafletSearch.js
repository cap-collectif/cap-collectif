// @flow
import { GeoSearchControl, GoogleProvider } from 'leaflet-geosearch';
import { MapControl } from 'react-leaflet';
import { intlShape, injectIntl } from 'react-intl';
import config from '../../../config';

export class LeafletSearch extends MapControl {
  createLeafletElement() {
    const { intl } = this.props;

    const googleProvider = new GoogleProvider({
      params: {
        key: config.mapsServerKey,
      },
    });

    return GeoSearchControl({
      position: 'topright',
      style: 'button',
      provider: googleProvider,
      showMarker: false,
      showPopup: false,
      autoClose: false,
      keepResult: false,
      searchLabel: intl.formatMessage({
        id: 'search_placeholder',
        values: {},
      }),
      retainZoomLevel: false,
      animateZoom: true,
      notFoundMessage: intl.formatMessage({
        id: 'sorry-that-address-could-not-be-found',
        values: {},
      }),
      messageHideDelay: 3000,
      zoomLevel: 18,
      classNames: {
        container: 'leaflet-bar leaflet-control leaflet-control-geosearch',
        button: 'search',
        resetButton: 'reset',
        msgbox: 'leaflet-bar message',
        form: '',
        input: '',
      },
      autoComplete: true,
      autoCompleteDelay: 250,
    });
  }
}

LeafletSearch.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LeafletSearch);
