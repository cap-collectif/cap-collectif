/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import LoginOverlay from './LoginOverlay';
import IntlData from '../../translations/FR';

describe('<LoginOverlay />', () => {
  const props = {
    ...IntlData,
  };

  it('renders children if not enabled', () => {
    const wrapper = shallow(
      <LoginOverlay enabled={false} {...props}>
        <div className="foo" />
      </LoginOverlay>
    );
    expect(wrapper.html()).to.equal('<div class="foo"></div>');
  });

  it('renders children if user is logged', () => {
    const wrapper = shallow(
      <LoginOverlay enabled user={{}} {...props}>
        <div className="foo" />
      </LoginOverlay>
    );
    expect(wrapper.html()).to.equal('<div class="foo"></div>');
  });

  it('renders popover if user is not logged', () => {
    const wrapper = shallow(
      <LoginOverlay enabled user={null} {...props}>
        <div className="foo" />
      </LoginOverlay>
    );
    expect(wrapper.find('OverlayTrigger')).to.have.length(1);
    expect(wrapper.find('OverlayTrigger').html()).to.equal('<div class="foo" aria-describedby="login-popover"></div>');
  });

});
