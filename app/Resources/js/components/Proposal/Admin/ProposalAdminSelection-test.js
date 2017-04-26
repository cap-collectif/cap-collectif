/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminSelections } from './ProposalAdminSelections';

describe('<ProposalAdminSelection />', () => {
  const props = {
    dispatch: jest.fn(),
    steps: [{}],
    projectId: 'projectId',
    proposalId: 1,
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminSelections {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
