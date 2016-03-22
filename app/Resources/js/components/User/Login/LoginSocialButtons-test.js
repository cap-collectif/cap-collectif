/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import LoginSocialButtons from './LoginSocialButtons';
import IntlData from '../../../translations/FR';

describe('<LoginSocialButtons />', () => {
  const props = {
    ...IntlData,
  };

  it('renders nothing if login_facebook is not activate', () => {
    LoginSocialButtons.__Rewire__('FeatureStore', {
      isActive: () => false,
    });
    const wrapper = shallow(<LoginSocialButtons {...props} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('renders a button if feature is active', () => {
    LoginSocialButtons.__Rewire__('FeatureStore', {
      isActive: () => true,
    });
    const wrapper = shallow(<LoginSocialButtons {...props} />);
    expect(wrapper.find('FacebookLoginButton')).to.have.length(1);
    expect(wrapper.find('GoogleLoginButton')).to.have.length(1);
    expect(wrapper.text()).to.contains('OU');
  });
});
