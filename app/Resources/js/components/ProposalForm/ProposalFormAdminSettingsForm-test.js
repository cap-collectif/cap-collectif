// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminSettingsForm } from './ProposalFormAdminSettingsForm';

describe('<ProposalFormAdminSettingsForm />', () => {
  const props = {
    handleSubmit: jest.fn(),
    intl: global.intlMock,
    invalid: false,
    pristine: false,
    submitting: false,
    proposalForm: {
      id: 'proposalFormId',
      title: 'title',
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminSettingsForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
