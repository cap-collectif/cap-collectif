// @flow
import * as React from 'react';
import Providers from './Providers';
import Shield from '../components/Page/ShieldPage';

export default (props: { chartBody: ?string }) => (
  <Providers>
    <Shield {...props} />
  </Providers>
);
