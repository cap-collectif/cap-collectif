// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ConsultationPropositionBox, {
  type OwnProps as Props,
} from '../components/Consultation/ConsultationPropositionBox';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider timeZone={window.timeZone}>
      <ConsultationPropositionBox {...props} />
    </IntlProvider>
  </Provider>
);
