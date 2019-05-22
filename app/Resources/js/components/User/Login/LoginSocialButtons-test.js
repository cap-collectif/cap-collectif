// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LoginSocialButtons } from './LoginSocialButtons';
import { features } from '../../../redux/modules/default';

describe('<LoginSocialButtons />', () => {
  const props = {
    features: { ...features },
  };
  const propsWithFeatureLoginGoogleActivated = {
    features: {
      ...features,
      login_gplus: true,
    },
  };
  const propsWithFeatureLoginFacebookActivated = {
    features: {
      ...features,
      login_facebook: true,
    },
  };
  const propsWithFeatureLoginSamlActivated = {
    features: {
      ...features,
      login_saml: true,
    },
  };
  const propsWithFeatureLoginOpenIDActivated = {
    features: {
      ...features,
      login_openid: true,
    },
  };
  const propsWithAllLoginFeaturesLoginActivated = {
    features: {
      ...features,
      login_gplus: true,
      login_facebook: true,
      login_saml: true,
      login_openid: true,
    },
  };

  it('renders nothing', () => {
    const wrapper = shallow(<LoginSocialButtons {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only Facebook button', () => {
    const wrapper = shallow(<LoginSocialButtons {...propsWithFeatureLoginFacebookActivated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only Google button', () => {
    const wrapper = shallow(<LoginSocialButtons {...propsWithFeatureLoginGoogleActivated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only SAML button', () => {
    const wrapper = shallow(<LoginSocialButtons {...propsWithFeatureLoginSamlActivated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only OpenID button', () => {
    const wrapper = shallow(<LoginSocialButtons {...propsWithFeatureLoginOpenIDActivated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders all buttons', () => {
    const wrapper = shallow(<LoginSocialButtons {...propsWithAllLoginFeaturesLoginActivated} />);
    expect(wrapper).toMatchSnapshot();
  });
});
