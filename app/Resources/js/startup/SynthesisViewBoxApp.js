// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import SynthesisBox from '../components/Synthesis/SynthesisBox';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <SynthesisBox {...props} />
    </IntlProvider>
  </Provider>
);
