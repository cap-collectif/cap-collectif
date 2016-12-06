/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { LoginSocialButtons } from './LoginSocialButtons';
import IntlData from '../../../translations/FR';

describe('<LoginSocialButtons />', () => {
  const props = {
    ...IntlData,
  };

  it('renders nothing if login_facebook is not activate', () => {
    const wrapper = shallow(<LoginSocialButtons features={{ login_facebook: false, login_gplus: false }} {...props} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('renders a button if feature is active', () => {
    const wrapper = shallow(<LoginSocialButtons features={{ login_facebook: true, login_gplus: true }} {...props} />);
    expect(wrapper.find('FacebookLoginButton')).to.have.length(1);
    expect(wrapper.find('GoogleLoginButton')).to.have.length(1);
    expect(wrapper.text()).to.contains('OU');
  });
});
