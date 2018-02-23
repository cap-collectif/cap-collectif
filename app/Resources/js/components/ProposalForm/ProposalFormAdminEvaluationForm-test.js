// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminEvaluationForm } from './ProposalFormAdminEvaluationForm';
import { intlMock, formMock } from '../../mocks';

describe('<ProposalFormAdminEvaluationForm />', () => {
  const props = {
    intl: intlMock,
    ...formMock,
    // $FlowFixMe $refType
    proposalForm: {
      id: 'proposalFormId',
      evaluationForm: null,
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminEvaluationForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
