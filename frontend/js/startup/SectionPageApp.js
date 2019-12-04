// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import SectionPage, { type Props } from '../components/Consultation/SectionPage';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <SectionPage {...props} />
    </IntlProvider>
  </Provider>
);
