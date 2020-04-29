// @flow
import * as React from 'react';
import Providers from './Providers';
import AccountBox from '../components/User/Profile/AccountBox';

export default (props: Object) => (
  <Providers>
      <AccountBox {...props} />
    </Providers>
);
