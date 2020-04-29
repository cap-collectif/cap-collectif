// @flow
import * as React from 'react';
import Providers from './Providers';
import EngagementList from '~/components/InteClient/Engagement/EngagementList/EngagementList';

export default (props: Object) => (
  <Providers>
      <EngagementList {...props} />
    </Providers>
);
