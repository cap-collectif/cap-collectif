/* eslint-env jest */
import React from 'react';
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
    expect(wrapper.find('Input')).toHaveLength(2);
  });

  it('renders an email input', () => {
    const wrapper = shallow(<LoginForm {...props} />);
    const input = wrapper.find('Input').first();
    expect(input.prop('id')).toEqual('_username');
    expect(input.prop('type')).toEqual('email');
    expect(input.prop('autoFocus')).toEqual(true);
    expect(input.prop('label')).toEqual('Adresse électronique');
    expect(input.prop('labelClassName')).toEqual('h5');
  });

  it('renders a password input', () => {
    const wrapper = shallow(<LoginForm {...props} />);
    const input = wrapper.find('Input').last();
    expect(input.prop('id')).toEqual('_password');
    expect(input.prop('type')).toEqual('password');
    expect(input.prop('label')).toEqual('Mot de passe');
    expect(input.prop('help')).not.toBeDefined();
    expect(input.prop('labelClassName')).toEqual('w100 h5');
  });
});
