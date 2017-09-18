// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminNotificationForm } from './ProposalFormAdminNotificationForm';

describe('<ProposalFormAdminNotificationForm />', () => {
  const props = {
    intl: global.intlMock,
    proposalForm: {},
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminNotificationForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
