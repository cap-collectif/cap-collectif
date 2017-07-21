// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RegistrationQuestionForm } from './RegistrationQuestionForm';
import IntlData from '../../translations/FR';

describe('<RegistrationQuestionForm />', () => {
  const props = {
    ...IntlData,
    showChoices: false,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationQuestionForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
