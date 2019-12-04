// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireStepPage } from './QuestionnaireStepPage';

describe('<QuestionnaireStepPage />', () => {
  const defaultProps = {
    questionnaireId: '1',
    isAuthenticated: true,
    isPrivateResult: false,
    enableResults: true,
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

  it('renders correctly when enableResults is false', () => {
    const props = {
      ...defaultProps,
      enableResults: false,
    };
    const wrapper = shallow(<QuestionnaireStepPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when enableResults is null', () => {
    const props = {
      ...defaultProps,
      enableResults: null,
    };

    // $FlowFixMe
    const wrapper = shallow(<QuestionnaireStepPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
