// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireStepPage } from './QuestionnaireStepPage';

describe('<QuestionnaireStepPage />', () => {
  const defaultProps = {
    initialQuestionnaireId: '1',
    isAuthenticated: true,
    dispatch: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<QuestionnaireStepPage {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when not authenticated', () => {
    const props = {
      ...defaultProps,
      isAuthenticated: false,
    };
    const wrapper = shallow(<QuestionnaireStepPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
