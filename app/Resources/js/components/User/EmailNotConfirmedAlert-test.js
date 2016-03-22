/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import EmailNotConfirmedAlert from './EmailNotConfirmedAlert';
import IntlData from '../../translations/FR';

describe('<EmailNotConfirmedAlert />', () => {
  const props = {
    ...IntlData,
  };

  it('renders nothing if not logged', () => {
    EmailNotConfirmedAlert.__Rewire__('LoginStore', {
      isLoggedIn: () => false,
    });
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('renders nothing if logged user has confirmed his email', () => {
    EmailNotConfirmedAlert.__Rewire__('LoginStore', {
      isLoggedIn: () => true,
      isEmailConfirmed: () => true,
    });
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('renders an alert if user is logged and confirmed his email', () => {
    EmailNotConfirmedAlert.__Rewire__('LoginStore', {
      isLoggedIn: () => true,
      isEmailConfirmed: () => false,
    });
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} />);
    expect(wrapper.find('Alert')).to.have.length(1);
  });

  it('renders a button to resend confirmation', () => {
    EmailNotConfirmedAlert.__Rewire__('LoginStore', {
      isLoggedIn: () => true,
      isEmailConfirmed: () => false,
    });
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} />);
    expect(wrapper.find('Button')).to.have.length(1);
    expect(wrapper.find('Button').prop('disabled')).to.equal(false);
    expect(wrapper.find('Button').prop('onClick')).to.be.a('function');
  });


  it('renders a disabled button when resending', () => {
    EmailNotConfirmedAlert.__Rewire__('LoginStore', {
      isLoggedIn: () => true,
      isEmailConfirmed: () => false,
    });
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} />);
    wrapper.setState({ resendingConfirmation: true });
    expect(wrapper.find('Button').prop('onClick')).to.be.null;
    expect(wrapper.find('Button').prop('disabled')).to.equal(true);
  });

  it('renders a disabled button when resending is done', () => {
    EmailNotConfirmedAlert.__Rewire__('LoginStore', {
      isLoggedIn: () => true,
      isEmailConfirmed: () => false,
    });
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} />);
    wrapper.setState({ confirmationSent: true });
    expect(wrapper.find('Button').prop('bsStyle')).to.equal('primary');
    expect(wrapper.find('Button').prop('disabled')).to.equal(true);
  });
});
