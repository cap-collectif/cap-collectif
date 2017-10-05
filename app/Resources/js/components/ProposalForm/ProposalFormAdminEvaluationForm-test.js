// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminEvaluationForm } from './ProposalFormAdminEvaluationForm';

describe('<ProposalFormAdminEvaluationForm />', () => {
  const props = {
    handleSubmit: jest.fn(),
    invalid: false,
    pristine: false,
    submitting: false,
    proposalForm: {
      id: 'proposalFormId',
      evaluationForms: [],
      evaluationForm: null,
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminEvaluationForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
