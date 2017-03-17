// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { AddNewQuestionModal } from './AddNewQuestionModal';
import IntlData from '../../translations/FR';

describe('<AddNewQuestionModal />', () => {
  const props = {
    ...IntlData,
    submitting: false,
    show: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<AddNewQuestionModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
