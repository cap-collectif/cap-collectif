// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import PresentationStepEvents, {
  type Props,
} from '../components/PresentationStep/PresentationStepEvents';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <PresentationStepEvents {...props} />
    </IntlProvider>
  </Provider>
);
