// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminEvaluationForm } from './ProposalFormAdminEvaluationForm';
import { $refType, intlMock, formMock } from '../../mocks';

describe('<ProposalFormAdminEvaluationForm />', () => {
  const props = {
    intl: intlMock,
    ...formMock,
    proposalForm: {
      $refType,
      id: 'proposalFormId',
      evaluationForm: null,
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminEvaluationForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
