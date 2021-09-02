// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const SSOSwitchUserPage = lazy(() =>
  import(/* webpackChunkName: "SSOSwitchUserPage" */ '~/components/Page/SSOSwitchUserPage'),
);

export default (props: { destination: ?string, user: ?{| username: string |} }) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      {/** $FlowFixMe redux overrides user type, incomprehensible */}
      <SSOSwitchUserPage {...props} />
    </Providers>
  </Suspense>
);
