/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import RegistrationForm from './RegistrationForm';
import IntlData from '../../../translations/FR';

describe('<RegistrationForm />', () => {
  const props = {
    ...IntlData,
    isSubmitting: false,
  };

  it('renders a form with inputs and a captcha', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    expect(wrapper.find('form')).to.have.length(1);
    expect(wrapper.find('form').prop('id')).to.equal('registration-form');
    expect(wrapper.find('Input')).to.have.length(4);
    expect(wrapper.find('AsyncScriptLoader')).to.have.length(1);
    expect(wrapper.find('AsyncScriptLoader').prop('sitekey')).to.equal('6LctYxsTAAAAANsAl06GxNeV5xGaPjy5jbDe-J8M');
  });

  it('renders a username input', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    const input = wrapper.find('Input').first();
    expect(input.prop('id')).to.equal('_username');
    expect(input.prop('autoFocus')).to.equal(true);
    expect(input.prop('type')).to.equal('text');
    expect(input.prop('label')).to.equal('Nom complet *');
    expect(input.prop('help')).to.equal('Votre nom sera rendu public sur le site.');
    expect(input.prop('labelClassName')).to.equal('h5');
  });

  it('renders an email input', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    const input = wrapper.find('Input').at(1);
    expect(input.prop('id')).to.equal('_email');
    expect(input.prop('type')).to.equal('text');
    expect(input.prop('label')).to.equal('Adresse électronique *');
    expect(input.prop('help')).to.not.exist;
    expect(input.prop('labelClassName')).to.equal('h5');
  });

  it('renders a password input', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    const input = wrapper.find('Input').at(2);
    expect(input.prop('id')).to.equal('_password');
    expect(input.prop('type')).to.equal('password');
    expect(input.prop('label')).to.equal('Mot de passe *');
    expect(input.prop('help')).to.not.exist;
    expect(input.prop('labelClassName')).to.equal('h5');
  });

  it('renders a charte checkbox', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    const input = wrapper.find('Input').at(3);
    expect(input.prop('id')).to.equal('_charte');
    expect(input.prop('type')).to.equal('checkbox');
    expect(input.prop('label')).to.equal('J\'ai lu et j\'accepte la charte.');
    expect(input.prop('help')).to.not.exist;
    expect(input.prop('labelClassName')).to.equal('h5');
  });
});
