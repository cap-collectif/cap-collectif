// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { AddRegistrationQuestionModal } from './AddRegistrationQuestionModal';

describe('<AddRegistrationQuestionModal />', () => {
  const props = {
    submitting: false,
    show: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<AddRegistrationQuestionModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
