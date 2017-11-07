// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminNotificationForm } from './ProposalFormAdminNotificationForm';

describe('<ProposalFormAdminNotificationForm />', () => {
  const props = {
    intl: global.intlMock,
    submitting: false,
    pristine: false,
    handleSubmit: jest.fn(),
    invalid: false,
    proposalForm: {
      id: 'proposalFormId',
      notificationsConfiguration: {
        onCreate: true,
        onUpdate: true,
        onDelete: true,
        onCommentCreate: true,
        onCommentUpdate: true,
        onCommentDelete: true,
      },
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminNotificationForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
