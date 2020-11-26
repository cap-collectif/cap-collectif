// @flow
import * as React from 'react';
import Providers from './Providers';
import ToastsContainer from '~ds/Toast/ToastsContainer';

const ToastsContainerApp = () => (
  <Providers>
    <ToastsContainer />
  </Providers>
);

export default ToastsContainerApp;
