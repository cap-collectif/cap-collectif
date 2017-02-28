// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RegistrationForm } from './RegistrationForm';
import IntlData from '../../../translations/FR';

describe('<RegistrationForm />', () => {
  const props = {
    dispatch: () => {},
    ...IntlData,
    onSubmitSuccess: () => {},
    onSubmitFail: () => {},
    userTypes: [],
    parameters: {
      'signin.cgu.name': 'la charte',
      'signin.cgu.link': '/charte',
    },
    features: {
      user_type: false,
      zipcode_at_register: false,
    },
    dynamicFields: [],
  };

  it('renders a form with inputs and a captcha', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    expect(wrapper.find('ReduxForm')).toHaveLength(1);
    expect(wrapper.find('ReduxForm').prop('form')).toEqual('registration-form');
    expect(wrapper.find('ReduxForm').prop('fields')).toHaveLength(5);
  });

  it('renders a username input', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    expect(wrapper.find('ReduxForm').prop('fields')[0]).toMatchObject(
      {
        name: 'username',
        label: 'Nom ou pseudonyme',
        labelClassName: 'h5',
        type: 'text',
        id: 'username',
        autoComplete: 'username',
      },
    );
  });

  it('renders an email input', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    expect(wrapper.find('ReduxForm').prop('fields')[1]).toMatchObject(
      {
        name: 'email',
        label: 'Adresse électronique',
        labelClassName: 'h5',
        type: 'email',
        id: 'email',
        popover: {
          id: 'registration-email-tooltip',
          message: 'Vous recevrez un e-mail contenant un lien permettant de confirmer qu\'il s\'agit bien de votre adresse.',
        },
        autoComplete: 'email',
      },
    );
  });

  it('renders a password input', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    expect(wrapper.find('ReduxForm').prop('fields')[2]).toMatchObject(
      {
        name: 'plainPassword',
        label: 'Créez un mot de passe',
        labelClassName: 'h5',
        type: 'password',
        id: 'password',
        popover: {
          id: 'registration-password-tooltip',
          message: 'Le mot de passe doit comporter au moins huit caractères.',
        },
        autoComplete: 'new-password',
      },
    );
  });

  it('renders a user_type select', () => {
    const wrapper = shallow(<RegistrationForm {...props} userTypes={[{ id: 1, name: 'type_1' }]} features={{ user_type: true, zipcode_at_register: false }} />);
    const select = wrapper.find('ReduxForm').prop('fields')[3];
    expect(select).toMatchObject(
      {
        name: 'userType',
        type: 'select',
        labelClassName: 'h5',
        id: 'user_type',
        options: [
          {
            label: 'type_1',
            value: 1,
          },
        ],
        placeholder: 'Je suis...',
      },
    );
    expect(select.label).toBeDefined();
  });

  it('renders a charte checkbox', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    const checkbox = wrapper.find('ReduxForm').prop('fields')[3];
    expect(checkbox).toMatchObject(
      {
        name: 'charte',
        labelClassName: 'h5',
        type: 'checkbox',
        id: 'charte',
      },
    );
    expect(checkbox.label).toBeDefined();
  });
});
