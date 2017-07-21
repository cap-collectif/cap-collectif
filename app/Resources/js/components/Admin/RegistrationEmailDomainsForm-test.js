// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RegistrationEmailDomainsForm } from './RegistrationEmailDomainsForm';
import IntlData from '../../translations/FR';

describe('<RegistrationEmailDomainsForm />', () => {
  const props = {
    ...IntlData,
    submitting: false,
    handleSubmit: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationEmailDomainsForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
