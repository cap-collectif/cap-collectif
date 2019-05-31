// @flow
import { MapControl } from 'react-leaflet';
import { intlShape, injectIntl } from 'react-intl';
import L from 'leaflet';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min';

type Props = {
  position: ?string,
};

export class LocateControl extends MapControl<Props> {
  static defaultProps = {
    position: 'topleft',
  };

  componentWillMount() {
    const { intl, position } = this.props;
    this.leafletElement = L.control.locate({
      position,
      flyTo: true,
      icon: 'cap-compass-3',
      strings: {
        title: intl.formatMessage({ id: 'proposal.map.form.control.title' }),
        metersUnit: intl.formatMessage({
          id: 'proposal.map.form.control.metersUnit',
        }),
        feetUnit: intl.formatMessage({
          id: 'proposal.map.form.control.feetUnit',
        }),
        popup: intl.formatMessage({
          id: 'proposal.map.form.control.popup',
          values: {},
        }),
        outsideMapBoundsMsg: intl.formatMessage({
          id: 'proposal.map.form.control.outsideMapBoundsMsg',
        }),
      },
      drawCircle: false,
    });
  }
}

LocateControl.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LocateControl);
