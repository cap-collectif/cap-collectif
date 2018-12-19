// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminSettingsForm } from './ProposalFormAdminSettingsForm';
import { $refType, intlMock, formMock } from '../../mocks';

describe('<ProposalFormAdminSettingsForm />', () => {
  const props = {
    intl: intlMock,
    ...formMock,
    isSuperAdmin: true,
    proposalForm: {
      $refType,
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
