/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { shallow } from 'enzyme';
import { RegistrationForm } from './RegistrationForm';
import IntlData from '../../../translations/FR';
import chai from 'chai';
import chaiSubset from 'chai-subset';

chai.use(chaiSubset);
const expect = chai.expect;

describe('<RegistrationForm />', () => {
  const props = {
    dispatch: () => {},
    ...IntlData,
    onSubmitSuccess: () => {},
    onSubmitFail: () => {},
    user_types: [],
    parameters: {
      'signin.cgu.name': 'la charte',
      'signin.cgu.link': '/charte',
    },
    features: {
      'user_type': false,
      'zipcode_at_register': false,
    },
  };

  it('renders a form with inputs and a captcha', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    expect(wrapper.find('ReduxForm')).to.have.length(1);
    expect(wrapper.find('ReduxForm').prop('form')).to.equal('registration-form');
    expect(wrapper.find('ReduxForm').prop('fields')).to.have.length(5);
    // expect(wrapper.find('AsyncScriptLoader')).to.have.length(1);
    // expect(wrapper.fi  nd('AsyncScriptLoader').prop('sitekey')).to.equal('6LctYxsTAAAAANsAl06GxNeV5xGaPjy5jbDe-J8M');
  });

  it('renders a username input', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    expect(wrapper.find('ReduxForm').prop('fields')).to.contains(
      {
        name: 'username',
        label: 'Nom ou pseudonyme',
        labelClassName: 'h5',
        type: 'text',
        id: '_username',
      }
    );
  });

  it('renders an email input', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    expect(wrapper.find('ReduxForm').prop('fields')).to.contains(
      {
        name: 'email',
        label: 'Adresse électronique',
        labelClassName: 'h5',
        type: 'email',
        id: '_email',
        popover: {
          id: 'registration-email-tooltip',
          message: 'Vous recevrez un e-mail contenant un lien permettant de confirmer qu\'il s\'agit bien de votre adresse.',
        },
      }
    );
  });

  it('renders a password input', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    expect(wrapper.find('ReduxForm').prop('fields')).to.contains(
      {
        name: 'plainPassword',
        label: 'Créez un mot de passe',
        labelClassName: 'h5',
        type: 'password',
        id: '_password',
        popover: {
          id: 'registration-password-tooltip',
          message: 'Le mot de passe doit comporter au moins huit caractères.',
        },
      }
    );
  });

  it('renders a user_type select', () => {
    const wrapper = shallow(<RegistrationForm {...props} user_types={[{ id: 1, name: 'type_1' }]} features={{ user_type: true, zipcode_at_register: false }} />);
    const select = wrapper.find('ReduxForm').prop('fields')[3];
    expect(select).to.containSubset(
      {
        name: 'userType',
        type: 'select',
        labelClassName: 'h5',
        id: '_user_type',
        options: [
          {
            label: 'type_1',
            value: 1,
          },
        ],
        defaultOptionLabel: 'Je suis...',
      }
    );
    expect(select.label).to.be.a.symbol;
  });

  it('renders a charte checkbox', () => {
    const wrapper = shallow(<RegistrationForm {...props} />);
    const checkbox = wrapper.find('ReduxForm').prop('fields')[3];
    expect(checkbox).to.containSubset(
      {
        name: 'charte',
        labelClassName: 'h5',
        type: 'checkbox',
        id: '_charte',
      }
    );
    expect(checkbox.label).to.be.a.symbol;
  });
});
