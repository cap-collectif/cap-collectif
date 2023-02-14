// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminNotificationForm } from './ProposalFormAdminNotificationForm';
import { $refType, intlMock } from '../../mocks';

describe('<ProposalFormAdminNotificationForm />', () => {
  const props = {
    intl: intlMock,
    submitting: false,
    pristine: false,
    handleSubmit: jest.fn(),
    invalid: false,
    valid: false,
    submitSucceeded: false,
    submitFailed: false,
    proposalForm: {
      creator: {
        email: 'creator',
      },
      $refType,
      id: 'proposalFormId',
      notificationsConfiguration: {
        onCreate: true,
        onUpdate: true,
        onDelete: true,
        onCommentCreate: true,
        onCommentUpdate: true,
        onCommentDelete: true,
        onProposalNewsCreate: true,
        onProposalNewsUpdate: true,
        onProposalNewsDelete: true,
        email: null,
      },
    },
    isOnlyProjectAdmin: false,
    organizationId: null,
  };

  it('should hide email field if viewer is admin or super admin', () => {
    const wrapper = shallow(<ProposalFormAdminNotificationForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should show email field if viewer is only project admin', () => {
    const wrapper = shallow(<ProposalFormAdminNotificationForm {...props} isOnlyProjectAdmin />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should show email field if viewer belongs to an organization', () => {
    const wrapper = shallow(<ProposalFormAdminNotificationForm {...props} organizationId="organizationId" />);
    expect(wrapper).toMatchSnapshot();
  });
});
