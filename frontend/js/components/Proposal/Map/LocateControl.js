// @flow
import { createControlComponent } from '@react-leaflet/core';
import { type IntlShape, injectIntl } from 'react-intl';
import { Control } from 'leaflet';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min';

export default injectIntl(
  createControlComponent(
    ({ position, intl }: {| +intl: IntlShape, position: ?string |}) =>
      new Control.Locate({
        position: position || 'topleft',
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
      }),
  ),
);
