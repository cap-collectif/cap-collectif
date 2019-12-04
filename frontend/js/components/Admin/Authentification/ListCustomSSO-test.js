// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ListCustomSSO } from './ListCustomSSO';
import { $fragmentRefs, $refType } from '../../../mocks';

describe('<ListCustomSSO />', () => {
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
  };

  it('renders correctly with items', () => {
    const wrapper = shallow(<ListCustomSSO {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with empty list', () => {
    const wrapper = shallow(<ListCustomSSO ssoConfigurations={{ ...$refType, edges: [] }} />);
    expect(wrapper).toMatchSnapshot();
  });
});
