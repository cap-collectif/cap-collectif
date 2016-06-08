/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { RegistrationForm } from './RegistrationForm';
import IntlData from '../../../translations/FR';

describe('<RegistrationForm />', () => {
  const props = {
    ...IntlData,
    isSubmitting: false,
    user_types: [],
  };

  const parameters = {
    'signin.cgu.name': 'la charte',
    'signin.cgu.link': '/charte',
  };

  const noParameters = {
    'signin.cgu.name': null,
    'signin.cgu.link': null,
  };

  it('renders a form with inputs and a captcha', () => {
    const wrapper = shallow(<RegistrationForm features={{ 'user_type': false, 'zipcode_at_register': false }} parameters={parameters} {...props} />);
    expect(wrapper.find('form')).to.have.length(1);
    expect(wrapper.find('form').prop('id')).to.equal('registration-form');
    expect(wrapper.find('Input')).to.have.length(4);
    expect(wrapper.find('AsyncScriptLoader')).to.have.length(1);
    expect(wrapper.find('AsyncScriptLoader').prop('sitekey')).to.equal('6LctYxsTAAAAANsAl06GxNeV5xGaPjy5jbDe-J8M');
  });

  it('renders a username input', () => {
    const wrapper = shallow(<RegistrationForm features={{ 'user_type': false, 'zipcode_at_register': false }} parameters={parameters} {...props} />);
    const input = wrapper.find('Input').first();
    expect(input.prop('id')).to.equal('_username');
    expect(input.prop('autoFocus')).to.equal(true);
    expect(input.prop('type')).to.equal('text');
    expect(input.prop('label')).to.equal('Nom ou pseudonyme');
    expect(input.prop('labelClassName')).to.equal('h5');
  });

  it('renders an email input', () => {
    const wrapper = shallow(<RegistrationForm features={{ 'user_type': false, 'zipcode_at_register': false }} parameters={parameters} {...props} />);
    const input = wrapper.find('Input').at(1);
    expect(input.prop('id')).to.equal('_email');
    expect(input.prop('type')).to.equal('text');
    expect(input.prop('help')).to.not.exist;
    expect(input.prop('labelClassName')).to.equal('h5 label--no-margin');
  });

  it('renders a password input', () => {
    const wrapper = shallow(<RegistrationForm features={{ 'user_type': false, 'zipcode_at_register': false }} parameters={parameters} {...props} />);
    const input = wrapper.find('Input').at(2);
    expect(input.prop('id')).to.equal('_password');
    expect(input.prop('type')).to.equal('password');
    expect(input.prop('help')).to.not.exist;
    expect(input.prop('labelClassName')).to.equal('h5 label--no-margin');
  });

  it('renders a charte checkbox when parameters are specified', () => {
    const wrapper = shallow(<RegistrationForm features={{ 'user_type': false, 'zipcode_at_register': false }} parameters={parameters} {...props} />);
    const input = wrapper.find('Input').at(3);
    expect(input.prop('id')).to.equal('_charte');
    expect(wrapper.find('Input').someWhere(n => n.prop('id') === '_charte')).to.equal(true);
    expect(input.prop('type')).to.equal('checkbox');
    expect(input.prop('help')).to.not.exist;
    expect(input.prop('labelClassName')).to.equal('h5');
  });

  it('does not render a charte checkbox when parameters are not specified', () => {
    const wrapper = shallow(<RegistrationForm features={{ 'user_type': false, 'zipcode_at_register': false }} parameters={noParameters} {...props} />);
    expect(wrapper.find('Input').someWhere(n => n.prop('id') === '_charte')).to.equal(false);
  });
});
