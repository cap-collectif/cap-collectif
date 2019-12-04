// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireStepTabs } from './QuestionnaireStepTabs';
import { $fragmentRefs, $refType, intlMock } from '../../mocks';

describe('<QuestionnaireStepTabs />', () => {
  it('renders correctly questionnaire is public', () => {
    const props = {
      intl: intlMock,
      enableResults: true,
      questionnaire: {
        privateResult: true,
        $refType,
        $fragmentRefs,
      },
    };
    const wrapper = shallow(<QuestionnaireStepTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when results are disabled', () => {
    const props = {
      intl: intlMock,
      enableResults: false,
      questionnaire: {
        privateResult: true,
        $refType,
        $fragmentRefs,
      },
    };
    const wrapper = shallow(<QuestionnaireStepTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly questionnaire is private', () => {
    const props = {
      intl: intlMock,
      enableResults: true,
      questionnaire: {
        privateResult: false,
        $refType,
        $fragmentRefs,
      },
    };
    const wrapper = shallow(<QuestionnaireStepTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
