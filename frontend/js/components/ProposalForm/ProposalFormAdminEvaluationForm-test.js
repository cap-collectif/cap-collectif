// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminEvaluationForm } from './ProposalFormAdminEvaluationForm';
import { $refType, intlMock, formMock } from '../../mocks';

const baseProps = {
  intl: intlMock,
  hasAccessToNewAnalysis: false,
  ...formMock,
  proposalForm: {
    $refType,
    id: 'proposalFormId',
    evaluationForm: null,
    step: {
      id: '12345789',
    },
  },
};

const props = {
  base: baseProps,
  withAccessToNewAnalysis: {
    ...baseProps,
    hasAccessToNewAnalysis: true,
  },
};

describe('<ProposalFormAdminEvaluationForm />', () => {
  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminEvaluationForm {...props.base} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly when access to new analysis', () => {
    const wrapper = shallow(<ProposalFormAdminEvaluationForm {...props.withAccessToNewAnalysis} />);
    expect(wrapper).toMatchSnapshot();
  });
});
