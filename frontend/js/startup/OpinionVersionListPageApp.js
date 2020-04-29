// @flow
import React from 'react';
import Providers from './Providers';
import OpinionVersionListPage from '../components/OpinionVersion/OpinionVersionListPage';
import type { Props } from '../components/OpinionVersion/OpinionVersionListPage';

export default (props: Props) => (
  <Providers>
    <OpinionVersionListPage {...props} />
  </Providers>
);
