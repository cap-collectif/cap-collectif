// @flow
import * as React from 'react';
import Providers from './Providers';
import UserSlider, { type Props } from '~/components/InteClient/UserSlider/UserSlider';

export default (props: Props) => (
  <Providers>
    <UserSlider {...props} />
  </Providers>
);
