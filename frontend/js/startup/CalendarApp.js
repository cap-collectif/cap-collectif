// @flow
import * as React from 'react';
import Providers from './Providers';
import Calendar from '~/components/InteClient/Calendar/Calendar';

export default (props: Object) => (
  <Providers>
    <Calendar {...props} />
  </Providers>
);
