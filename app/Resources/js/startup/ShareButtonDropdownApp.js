// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ShareButtonDropdown from '../components/Utils/ShareButtonDropdown';

type Props = {|
  id: string,
  enabled: boolean,
  title: string,
  url: string,
  className?: string,
  bsStyle?: string,
  style?: Object,
|};

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ShareButtonDropdown {...props} />
    </IntlProvider>
  </Provider>
);
