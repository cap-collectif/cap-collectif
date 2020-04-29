// @flow
import React from 'react';
import Providers from './Providers';
import MetaStepNavigationBox, { type Props } from '../components/Steps/MetaStepNavigationBox';

export default (props: Props) => (
  <Providers>
      <MetaStepNavigationBox {...props} />
    </Providers>
);
