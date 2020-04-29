// @flow
import React from 'react';
import Providers from './Providers';
import SectionListPage from '../components/Section/SectionListPage';
import type { Props } from '../components/Section/SectionListPage';

export default (props: Props) => (
  <Providers>
    <SectionListPage {...props} />
  </Providers>
);
