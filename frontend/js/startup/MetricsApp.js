// @flow
import React from 'react';
import Providers from './Providers';
import { SectionContainer, type Props } from '../components/Section/SectionContainer';

export default (props: Props) => (
  <Providers>
    <SectionContainer {...props} />
  </Providers>
);
