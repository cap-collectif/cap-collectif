// @flow
import React from 'react';
import Providers from './Providers';
import type { Props } from '../components/Source/SourcePage';
import SourcePage from '../components/Source/SourcePage';

export default (props: Props) => (
  <Providers>
    <SourcePage {...props} />
  </Providers>
);
