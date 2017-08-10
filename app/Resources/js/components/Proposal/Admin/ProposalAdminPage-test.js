// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminPage } from './ProposalAdminPage';

describe('<ProposalAdminPage />', () => {
  const props = { proposalId: 1 };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
