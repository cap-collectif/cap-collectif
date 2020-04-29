// @flow
import * as React from 'react';
import Providers from './Providers';
import EmailNotConfirmedAlert from '../components/User/EmailNotConfirmedAlert';
import NewEmailNotConfirmedAlert from '../components/User/NewEmailNotConfirmedAlert';

export default (props: Object) => (
  <span>
    <Providers>
        <EmailNotConfirmedAlert {...props} />
        <NewEmailNotConfirmedAlert {...props} />
    </Providers>
  </span>
);
