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
      privateResult: true,
      $refType,
    },
  };
  const currentValues = {
    privateResult: null,
  };

  const initialValuesPrivate1 = {
    anonymousAllowed: true,
    multipleRepliesAllowed: false,
    acknowledgeReplies: true,
    privateResult: 'private',
  };

  const initialValuesPrivate2 = {
    anonymousAllowed: false,
    multipleRepliesAllowed: true,
    acknowledgeReplies: false,
    privateResult: 'private',
  };

  const initialValuesPublic1 = {
    anonymousAllowed: true,
    multipleRepliesAllowed: false,
    acknowledgeReplies: true,
    privateResult: 'public',
  };

  const initialValuesPublic2 = {
    anonymousAllowed: false,
    multipleRepliesAllowed: true,
    acknowledgeReplies: false,
    privateResult: 'public',
  };

  it('renders correctly with private result and anonymous allowed', () => {
    const wrapper = shallow(
      <QuestionnaireAdminParametersForm
        {...formMock}
        {...questionnaireProps}
        currentValues={currentValues}
        initialValues={initialValuesPrivate1}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with private result and anonymous not allowed', () => {
    const wrapper = shallow(
      <QuestionnaireAdminParametersForm
        {...formMock}
        {...questionnaireProps}
        currentValues={currentValues}
        initialValues={initialValuesPrivate2}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with public result and anonymous allowed', () => {
    const wrapper = shallow(
      <QuestionnaireAdminParametersForm
        {...formMock}
        {...questionnaireProps}
        currentValues={currentValues}
        initialValues={initialValuesPublic1}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with public result and anonymous not allowed', () => {
    const wrapper = shallow(
      <QuestionnaireAdminParametersForm
        {...formMock}
        {...questionnaireProps}
        currentValues={currentValues}
        initialValues={initialValuesPublic2}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
