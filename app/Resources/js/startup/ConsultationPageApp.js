import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import ConsultationPropositionBox from '../components/Consultation/ConsultationPropositionBox';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ConsultationPropositionBox {...props} />
    </IntlProvider>
  </Provider>
);
