// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { UpdateRegistrationQuestionModal } from './UpdateRegistrationQuestionModal';
import IntlData from '../../translations/FR';

describe('<UpdateRegistrationQuestionModal />', () => {
  const props = {
    ...IntlData,
    submitting: false,
    show: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<UpdateRegistrationQuestionModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
