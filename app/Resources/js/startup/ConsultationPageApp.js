// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ConsultationPropositionBox from '../components/Consultation/ConsultationPropositionBox';

export default (props: any) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ConsultationPropositionBox {...props} />
    </IntlProvider>
  </Provider>
);
