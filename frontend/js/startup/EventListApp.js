// @flow
import React from 'react';
import Providers from './Providers';
import EventListProfile from '../components/Event/Profile/EventListProfile';

type Props = {
  userId?: string,
  isAuthenticated?: boolean,
};

export default (props: Props) => (
  <Providers>
      <EventListProfile {...props} />
    </Providers>
);
