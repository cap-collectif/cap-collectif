// @flow
import { connect } from 'react-redux';
import { MapControl, withLeaflet } from 'react-leaflet';
import { injectIntl, type IntlShape } from 'react-intl';
import { GeoSearchControl, GoogleProvider } from 'leaflet-geosearch';

import config from '~/config';
import type { State } from '~/types';

type Props = {
  intl: IntlShape,
  messageSearch: ?string,
  mapCountry: ?string,
  position?: string,
};

export class LeafletSearch extends MapControl<Props> {
  static defaultProps = {
    messageSearch: 'proposal_form.address',
    position: 'topright',
  };

  createLeafletElement() {
    const { intl, messageSearch, mapCountry, position } = this.props;

    const googleProvider = new GoogleProvider({
      params: {
        key: config.mapsServerKey,
        components: `country:${mapCountry || 'FR'}`,
      },
    });

    return GeoSearchControl({
      position,
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

const mapStateToProps = (state: State) => ({
  mapCountry: state.default.parameters['events.map.country'],
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(
  withLeaflet(injectIntl(LeafletSearch)),
);
