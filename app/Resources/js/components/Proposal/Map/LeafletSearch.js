// @flow
import { GeoSearchControl, GoogleProvider } from 'leaflet-geosearch';
import { MapControl } from 'react-leaflet';
import { injectIntl, type IntlShape } from 'react-intl';
import config from '../../../config';

type Props = {
  intl: IntlShape,
  messageSearch: ?string
};

export class LeafletSearch extends MapControl<Props> {
  static defaultProps = {
    messageSearch: 'search_placeholder',
  };

  createLeafletElement() {
    const { intl, messageSearch } = this.props;

    const googleProvider = new GoogleProvider({
      params: {
        key: config.mapsServerKey,
        components: 'country:FR',
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
        id: messageSearch,
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

export default injectIntl(LeafletSearch);
