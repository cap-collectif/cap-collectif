// @flow
import React from 'react';
import Providers from './Providers';
import EventAdmin, { type Props } from '../components/Event/Admin/EventAdmin';

export default (props: Props) => (
  <Providers>
      <EventAdmin {...props} />
    </Providers>
);
