// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import FollowingsBox from '../components/User/Following/FollowingsBox';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <FollowingsBox {...props} />
    </IntlProvider>
  </Provider>
);
