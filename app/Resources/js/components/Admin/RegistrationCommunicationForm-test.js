// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RegistrationCommunicationForm } from './RegistrationCommunicationForm';
import IntlData from '../../translations/FR';

describe('<RegistrationCommunicationForm />', () => {
  const props = {
    ...IntlData,
    useTopText: true,
    useBottomText: true,
    submitting: false,
    handleSubmit: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationCommunicationForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
