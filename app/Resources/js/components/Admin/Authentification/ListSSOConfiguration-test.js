// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ListSSOConfiguration } from './ListSSOConfiguration';
import { $fragmentRefs, $refType } from '../../../mocks';

describe('<ListSSOConfiguration />', () => {
  const props = {
    ssoConfigurations: {
      ...$refType,
      edges: [
        {
          node: {
            $fragmentRefs,
            id: 'oauth2ID',
            name: 'Open ID Provider',
            clientId: 'clientId',
            secret: 'SecretKey',
            authorizationUrl: 'https://localhost:8888/authorization',
            accessTokenUrl: 'https://localhost:8888/token',
            userInfoUrl: 'https://localhost:8888/user',
            logoutUrl: 'https://localhost:8888/logout',
          },
        },
      ],
    },
    isSuperAdmin: true,
  };

  it('renders correctly with items', () => {
    const wrapper = shallow(<ListSSOConfiguration {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with empty list', () => {
    const wrapper = shallow(
      <ListSSOConfiguration ssoConfigurations={{ ...$refType, edges: [] }} isSuperAdmin />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with only Public SSO list when user is not a super admin', () => {
    const wrapper = shallow(
      <ListSSOConfiguration ssoConfigurations={{ ...$refType, edges: [] }} isSuperAdmin={false} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
