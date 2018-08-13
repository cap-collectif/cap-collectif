// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalVotes } from './ProposalVotes';
import { $refType, $fragmentRefs, relayPaginationMock } from '../../../mocks';

describe('<ProposalVotes />', () => {
  const props = {
    proposal: {
      $refType,
      id: '1',
      votes: {
        edges: [
          { cursor: 'N0aW9uOjE=', node: { author: { id: 'userAdmin', $fragmentRefs } } },
          { cursor: 'N0aW9uOjE=', node: { author: { id: 'userJean', $fragmentRefs } } },
        ],
        totalCount: 2,
        pageInfo: {
          endCursor: 'cursor1',
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: null,
        },
      },
    },
    stepId: 'depot',
    relay: relayPaginationMock,
  };

  it('should render correctly proposal votes', () => {
    const wrapper = shallow(<ProposalVotes {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
