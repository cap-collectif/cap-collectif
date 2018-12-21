/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageFollowers } from './ProposalPageFollowers';
import { $refType, $fragmentRefs, relayPaginationMock } from '../../../mocks';

describe('<ProposalPageFollowers />', () => {
  const pageAdmin = false;
  const proposalWithUsers = {
    $refType,
    id: 'proposal1',
    followers: {
      edges: [
        { cursor: 'YXJyYXljb25uZWN0aW9uOjA=', node: { id: 'userAdmin', $fragmentRefs } },
        { cursor: 'YXJyYXljb25uZWN0aW9uOjE=', node: { id: 'user137', $fragmentRefs } },
        { cursor: 'YXJyYXljb25uZWN0aW9uOjI=', node: { id: 'user70', $fragmentRefs } },
      ],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: true,
        endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
        startCursor: 'YXJyYXljb25uZWN0aW9uOjA',
      },
      totalCount: 3,
    },
  };

  const proposalWithoutUsers = {
    $refType,
    id: 'proposal1',
    followers: {
      edges: [],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: false,
        endCursor: null,
        startCursor: null,
      },
      totalCount: 0,
    },
  };
  const props = {
    relay: relayPaginationMock,
  };

  it('should render a proposal page follower with users', () => {
    const wrapper = shallow(
      <ProposalPageFollowers proposal={proposalWithUsers} pageAdmin={pageAdmin} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal page follower with more 32 users', () => {
    const wrapper = shallow(
      <ProposalPageFollowers
        proposal={proposalWithUsers}
        {...props}
        pageAdmin={pageAdmin}
        relay={{ ...relayPaginationMock, hasMore: () => true }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal page follower without users', () => {
    const wrapper = shallow(
      <ProposalPageFollowers proposal={proposalWithoutUsers} pageAdmin={pageAdmin} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
