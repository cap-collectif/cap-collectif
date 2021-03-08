// @flow
import * as React from 'react';
import Providers from './Providers';
import WhatsNew, { type Props } from '~/components/InteClient/WhatsNew/WhatsNew';

export default (props: Props) => (
  <Providers>
    <WhatsNew {...props} />
  </Providers>
);
