// @flow
import React from 'react';
import Providers from './Providers';
import EventPage from '~/components/Event/EventPage/EventPage';

type Props = {
  userId?: string,
  isAuthenticated?: boolean,
};

export default (props: Props) => (
  <Providers>
    <EventPage {...props} />
  </Providers>
);
