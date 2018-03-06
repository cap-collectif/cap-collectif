// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { RegistrationCommunicationForm } from './RegistrationCommunicationForm';

describe('<RegistrationCommunicationForm />', () => {
  const props = {
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
