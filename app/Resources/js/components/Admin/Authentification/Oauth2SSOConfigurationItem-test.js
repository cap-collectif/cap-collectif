// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { Oauth2SSOConfigurationItem } from './Oauth2SSOConfigurationItem';
import { $refType } from '../../../mocks';

describe('<Oauth2SSOConfigurationItem />', () => {
  const props = {
    configuration: {
      ...$refType,
      id: 'oauth2ID',
      name: 'Open ID Provider',
      clientId: 'clientId',
      secret: 'SecretKey',
      authorizationUrl: 'https://localhost:8888/authorization',
      accessTokenUrl: 'https://localhost:8888/token',
      userInfoUrl: 'https://localhost:8888/user',
      logoutUrl: 'https://localhost:8888/logout',
      redirectUri: 'https://capco.test/login/check-openid',
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<Oauth2SSOConfigurationItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
