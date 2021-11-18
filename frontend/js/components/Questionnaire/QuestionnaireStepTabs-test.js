// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireStepTabs } from './QuestionnaireStepTabs';
import { $fragmentRefs, $refType, intlMock } from '../../mocks';

describe('<QuestionnaireStepTabs />', () => {
  const baseProps = {
    intl: intlMock,
    enableResults: true,
    questionnaire: {
      privateResult: true,
      $refType,
      $fragmentRefs,
    },
    query: {
      $refType,
      $fragmentRefs,
    },
  };

  it('renders correctly questionnaire is public', () => {
    const wrapper = shallow(<QuestionnaireStepTabs {...baseProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when results are disabled', () => {
    const props = {
      ...baseProps,
      enableResults: false,
    };
    const wrapper = shallow(<QuestionnaireStepTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly questionnaire is private', () => {
    const props = {
      ...baseProps,
      questionnaire: {
        ...baseProps.questionnaire,
        privateResult: false,
      },
    };
    const wrapper = shallow(<QuestionnaireStepTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
