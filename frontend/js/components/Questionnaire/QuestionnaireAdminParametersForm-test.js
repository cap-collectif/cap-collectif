// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireAdminParametersForm } from '~/components/Questionnaire/QuestionnaireAdminParametersForm';
import { $refType, formMock } from '~/mocks';

describe('<QuestionnaireAdminParametersForm />', () => {
  const questionnaireProps = {
    questionnaire: {
      id: 'id',
      acknowledgeReplies: true,
      multipleRepliesAllowed: true,
      anonymousAllowed: true,
      type: 'QUESTIONNAIRE',
      $refType,
    },
  };

  const initialValues1 = {
    anonymousAllowed: true,
    multipleRepliesAllowed: false,
    acknowledgeReplies: true,
    type: 'QUESTIONNAIRE',
  };

  const initialValues2 = {
    anonymousAllowed: false,
    multipleRepliesAllowed: true,
    acknowledgeReplies: false,
    type: 'QUESTIONNAIRE',
  };

  it('renders correctly with anonymous allowed', () => {
    const wrapper = shallow(
      <QuestionnaireAdminParametersForm
        {...formMock}
        {...questionnaireProps}
        initialValues={initialValues1}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with anonymous not allowed', () => {
    const wrapper = shallow(
      <QuestionnaireAdminParametersForm
        {...formMock}
        {...questionnaireProps}
        initialValues={initialValues2}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
