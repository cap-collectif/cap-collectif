// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { UpdateRegistrationQuestionModal } from './UpdateRegistrationQuestionModal';

describe('<UpdateRegistrationQuestionModal />', () => {
  const props = {
    submitting: false,
    show: true,
    onClose: jest.fn(),
    onSubmit: jest.fn()
  };

  it('renders correctly', () => {
    const wrapper = shallow(<UpdateRegistrationQuestionModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
