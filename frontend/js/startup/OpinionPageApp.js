// @flow
import React from 'react';
import Providers from './Providers';
import OpinionPage, { type Props } from '../components/Opinion/OpinionPage';

export default (props: Props) => (
  <Providers>
    <OpinionPage {...props} />
  </Providers>
);
