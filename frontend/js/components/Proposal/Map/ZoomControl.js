// @flow
import L from 'leaflet';
import { MapControl, withLeaflet } from 'react-leaflet';

type Props = {|
  position?: string,
|};

export class ZoomControl extends MapControl<Props> {
  static defaultProps = {
    position: 'topleft',
  };

  createLeafletElement() {
    const { position } = this.props;

    return new L.Control.Zoom({ position });
  }
}

export default withLeaflet(ZoomControl);
