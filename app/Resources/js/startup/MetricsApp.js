// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import { SectionContainer, type Props } from '../components/Section/SectionContainer';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <SectionContainer {...props} />
    </IntlProvider>
  </Provider>
);
