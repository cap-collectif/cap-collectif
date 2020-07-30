// @flow
import React from 'react';
import Providers from './Providers';
import StepEventsQueryRender, { type Props } from '../components/Steps/StepEventsQueryRender';

export default (props: Props) => (
  <Providers>
    <StepEventsQueryRender {...props} />
  </Providers>
);
