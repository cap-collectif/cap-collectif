// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminSettingsForm } from './ProposalFormAdminSettingsForm';
import { intlMock } from '../../mocks';

describe('<ProposalFormAdminSettingsForm />', () => {
  const props = {
    handleSubmit: jest.fn(),
    intl: intlMock,
    invalid: false,
    valid: false,
    submitSucceeded: false,
    submitFailed: false,
    pristine: false,
    submitting: false,
    isSuperAdmin: true,
    // $FlowFixMe $refType
    proposalForm: {
      id: 'proposalFormId',
      title: 'title',
      commentable: true,
      costable: true,
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminSettingsForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
