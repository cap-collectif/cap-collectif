// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { RegistrationEmailDomainsForm } from './RegistrationEmailDomainsForm';

describe('<RegistrationEmailDomainsForm />', () => {
  const props = {
    submitting: false,
    handleSubmit: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationEmailDomainsForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
