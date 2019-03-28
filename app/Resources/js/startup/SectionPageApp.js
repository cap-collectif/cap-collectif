import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import SectionPage from '../components/Consultation/SectionPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <SectionPage {...props} />
    </IntlProvider>
  </Provider>
);
