// @flow
import * as React from 'react';
import Providers from './Providers';
import HomeHeader, { type Props } from '~/components/InteClient/HomeHeader/HomeHeader';

export default (props: Props) => (
  <Providers>
    <HomeHeader {...props} />
  </Providers>
);
