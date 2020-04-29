// @flow
import * as React from 'react';
import Providers from './Providers';
import FollowingsBox from '../components/User/Following/FollowingsBox';

export default (props: Object) => (
  <Providers>
      <FollowingsBox {...props} />
    </Providers>
);
