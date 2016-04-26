/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import LoginForm from './LoginForm';
import IntlData from '../../../translations/FR';

describe('<LoginForm />', () => {
  const props = {
    ...IntlData,
    isSubmitting: false,
    onSubmitSuccess: () => {},
    onSubmitFailure: () => {},
  };

  it('renders a form with inputs', () => {
    const wrapper = shallow(<LoginForm {...props} />);
    expect(wrapper.find('Input')).to.have.length(2);
  });

  it('renders a username input', () => {
    const wrapper = shallow(<LoginForm {...props} />);
    const input = wrapper.find('Input').first();
    expect(input.prop('id')).to.equal('_username');
    expect(input.prop('type')).to.equal('text');
    expect(input.prop('autoFocus')).to.equal(true);
    expect(input.prop('label')).to.equal('Adresse électronique');
    expect(input.prop('labelClassName')).to.equal('h5');
  });

  it('renders a password input', () => {
    const wrapper = shallow(<LoginForm {...props} />);
    const input = wrapper.find('Input').last();
    expect(input.prop('id')).to.equal('_password');
    expect(input.prop('type')).to.equal('password');
    expect(input.prop('label')).to.equal('Mot de passe');
    expect(input.prop('help')).to.not.exist;
    expect(input.prop('labelClassName')).to.equal('w100 h5');
  });
});
