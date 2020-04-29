// @flow
import * as React from 'react';
import Providers from './Providers';
import SSOSwitchUserPage from '../components/Page/SSOSwitchUserPage';

export default (props: { destination: ?string, user: ?{| username: string |} }) => (
  <Providers>
    {/** $FlowFixMe redux overrides user type, incomprehensible */}
    <SSOSwitchUserPage {...props} />
  </Providers>
);
