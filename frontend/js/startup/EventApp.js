// @flow
import React from 'react';
import Providers from './Providers';
import EventPage from '../components/Event/EventPage';

export default (props: Object) => (
  <Providers>
      <EventPage {...props} />
    </Providers>
);
