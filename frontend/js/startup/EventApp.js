// @flow
import React from 'react';
import Providers from './Providers';
import EventListPage from '~/components/Event/EventListPage';

export default (props: Object) => (
  <Providers>
    <EventListPage {...props} />
  </Providers>
);
