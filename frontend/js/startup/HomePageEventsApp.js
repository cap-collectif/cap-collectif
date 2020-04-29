// @flow
import React from 'react';
import Providers from './Providers';
import HomePageEvents, { type Props } from '../components/HomePage/HomePageEvents';

export default (props: Props) => (
  <Providers>
      <HomePageEvents {...props} />
    </Providers>
);
