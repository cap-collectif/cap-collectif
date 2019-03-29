// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalTrashedListPaginated } from './ProposalTrashedListPaginated';
import { relayPaginationMock, $fragmentRefs } from '../../../mocks';

describe('<ProposalTrashedListPaginated />', () => {
  const props = {
    relay: relayPaginationMock,
    project: {
      id: 'project1',
      proposals: {
        totalCount: 3,
        edges: [
          { node: { id: 'proposal1', $fragmentRefs } },
          { node: { id: 'proposal2', $fragmentRefs } },
          { node: { id: 'proposal3', $fragmentRefs } },
        ],
      },
    },
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProposalTrashedListPaginated {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
