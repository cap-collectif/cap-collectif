// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { AddRegistrationQuestionModal } from './AddRegistrationQuestionModal';
import IntlData from '../../translations/FR';

describe('<AddRegistrationQuestionModal />', () => {
  const props = {
    ...IntlData,
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
