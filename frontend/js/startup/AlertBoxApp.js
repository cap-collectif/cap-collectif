// @flow
import React from 'react';
import Providers from './Providers';
import AlertBox, { type Props } from '../components/Alert/AlertBox';

export default ({ children, ...props }: Props) => (
  <Providers>
    <div id="global-alert-box">
      <AlertBox {...props} />
    </div>
    {children}
  </Providers>
);
