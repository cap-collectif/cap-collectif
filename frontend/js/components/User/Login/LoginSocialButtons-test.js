// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LoginSocialButtons } from './LoginSocialButtons';
import { disableFeatureFlags, enableFeatureFlags } from '~/testUtils';

describe('<LoginSocialButtons />', () => {
  const ssoList = [
    {
      name: 'Cap Collectif Oauth2 Provider',
      ssoType: 'oauth2',
    },
    {
      name: 'France Connect',
      ssoType: 'franceconnect',
    },
    {
      name: 'Cap Collectif CAS Provider',
      ssoType: 'cas',
    },
  ];

  const props = {
    ssoList: [],
  };
  const propsWithFeatureLoginFacebookActivated = {
    ssoList: [],
  };
  const propsWithFeatureLoginSamlActivated = {
    ssoList: [],
  };
  const propsWithFeatureLoginCasActivated = {
    ssoList: [
      {
        name: 'Cap Collectif CAS Provider',
        ssoType: 'cas',
      },
    ],
  };
  const propsWithFeatureLoginOpenIDActivated = {
    ssoList: [
      {
        name: 'Cap Collectif Oauth2 Provider',
        ssoType: 'oauth2',
      },
    ],
  };
  const propsWithFeatureLoginFranceConnectActivated = {
    ssoList: [
      {
        name: 'France Connect',
        ssoType: 'franceconnect',
      },
    ],
  };
  const propsWithAllLoginFeaturesLoginActivated = {
    ssoList,
  };

  const propsWithAllLoginFeaturesLoginActivatedAndORSeparatorDisabled = {
    ssoList,
  };
  afterEach(() => {
    disableFeatureFlags();
  });
  it('renders nothing', () => {
    const wrapper = shallow(<LoginSocialButtons {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only Facebook button', () => {
    enableFeatureFlags(['login_facebook']);
    const wrapper = shallow(<LoginSocialButtons {...propsWithFeatureLoginFacebookActivated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only SAML button', () => {
    enableFeatureFlags(['login_saml']);
    const wrapper = shallow(<LoginSocialButtons {...propsWithFeatureLoginSamlActivated} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders only CAS button', () => {
    enableFeatureFlags(['login_cas']);
    const wrapper = shallow(<LoginSocialButtons {...propsWithFeatureLoginCasActivated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only OpenID button', () => {
    enableFeatureFlags(['login_openid']);
    const wrapper = shallow(<LoginSocialButtons {...propsWithFeatureLoginOpenIDActivated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only FranceConnect button', () => {
    enableFeatureFlags(['login_franceconnect']);
    const wrapper = shallow(
      <LoginSocialButtons {...propsWithFeatureLoginFranceConnectActivated} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders all buttons', () => {
    // $FlowFixMe
    enableFeatureFlags(['login_facebook', 'login_saml', 'login_franceconnect', 'login_cas']);
    const wrapper = shallow(<LoginSocialButtons {...propsWithAllLoginFeaturesLoginActivated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without OR separator', () => {
    // $FlowFixMe
    enableFeatureFlags([
      'login_facebook',
      'login_saml',
      'login_franceconnect',
      'login_cas',
      'sso_by_pass_auth',
    ]);
    const wrapper = shallow(
      <LoginSocialButtons {...propsWithAllLoginFeaturesLoginActivatedAndORSeparatorDisabled} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
