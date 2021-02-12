// @flow
import * as React from 'react';
import Providers from './Providers';
import DebateCard from '~/components/InteClient/DebateCard/DebateCard';

export default (props: Object) => (
  <Providers>
    <DebateCard {...props} />
  </Providers>
);
