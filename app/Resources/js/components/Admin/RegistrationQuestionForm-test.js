// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { RegistrationQuestionForm } from './RegistrationQuestionForm';
import { intlMock } from '../../mocks';

describe('<RegistrationQuestionForm />', () => {
  const props = {
    showChoices: false,
    intl: intlMock,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationQuestionForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
