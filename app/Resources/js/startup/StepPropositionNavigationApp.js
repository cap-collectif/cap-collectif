// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import StepPropositionNavigationBox, {
  type OwnProps as Props,
} from '../components/Steps/StepPropositionNavigationBox';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider timeZone={window.timeZone}>
      <StepPropositionNavigationBox {...props} />
    </IntlProvider>
  </Provider>
);
