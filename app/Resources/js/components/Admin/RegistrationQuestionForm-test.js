// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RegistrationQuestionForm } from './RegistrationQuestionForm';

describe('<RegistrationQuestionForm />', () => {
  const props = {
    showChoices: false,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationQuestionForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
