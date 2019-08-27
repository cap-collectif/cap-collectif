import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import SectionContainer from '../components/Section/SectionContainer';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <SectionContainer {...props} />
    </IntlProvider>
  </Provider>
);
