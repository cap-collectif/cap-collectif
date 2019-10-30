// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ListSSOConfiguration } from './ListSSOConfiguration';
import { $fragmentRefs, $refType } from '../../../mocks';
import { features } from '../../../redux/modules/default';

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
    features: {
      ...features,
      list_sso: true,
    },
    isSuperAdmin: true,
  };

  it('renders correctly with items', () => {
    const wrapper = shallow(<ListSSOConfiguration {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with empty list', () => {
    const wrapper = shallow(
      <ListSSOConfiguration
        ssoConfigurations={{ ...$refType, edges: [] }}
        features={{ ...features, list_sso: true }}
        isSuperAdmin
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with only Public SSO list when associated feature toggle is disabled and not user is not a super admin', () => {
    const wrapper = shallow(
      <ListSSOConfiguration
        ssoConfigurations={{ ...$refType, edges: [] }}
        features={features}
        isSuperAdmin={false}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
