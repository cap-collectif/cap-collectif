// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RegistrationQuestionForm } from './RegistrationQuestionForm';

describe('<AddNewQuestionForm />', () => {
  const props = {};

  it('renders correctly', () => {
    const wrapper = shallow(
      <RegistrationQuestionForm showChoices={false} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for multiple choices', () => {
    const wrapper = shallow(
      <RegistrationQuestionForm showChoices {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
