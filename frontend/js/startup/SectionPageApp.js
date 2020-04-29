// @flow
import React from 'react';
import Providers from './Providers';
import SectionPage, { type Props } from '../components/Consultation/SectionPage';

export default (props: Props) => (
  <Providers>
    <SectionPage {...props} />
  </Providers>
);
