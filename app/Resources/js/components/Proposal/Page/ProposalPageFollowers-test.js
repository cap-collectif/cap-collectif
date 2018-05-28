/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageFollowers } from './ProposalPageFollowers';
import { relayPaginationMock } from '../../../mocks';

describe('<ProposalPageFollowers />', () => {
  const pageAdmin = false;
  // $FlowFixMe $refType
  const proposalWithUsers = {
    id: 'proposal1',
    followerConnection: {
      edges: [
        {
          cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          node: {
            id: 'userAdmin',
            username: 'admin',
            displayName: 'myname',
            contributionsCount: 0,
            show_url: true,
            media: {
              url: 'http://capco.dev',
            },
          },
        },
        {
          cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          node: {
            id: 'user137',
            username: 'akovacek',
            displayName: 'akovacek',
            contributionsCount: 55,
            show_url: true,
            media: {
              url: 'http://capco.dev',
            },
          },
        },
        {
          cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
          node: {
            id: 'user70',
            username: 'alva44',
            displayName: 'alva44',
            contributionsCount: 44,
            show_url: true,
            media: {
              url: 'http://capco.dev',
            },
          },
        },
      ],
      pageInfo: {
        hasNextPage: true,
        endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
      },

      totalCount: 3,
    },
  };
  // $FlowFixMe $refType
  const proposalWithoutUsers = {
    id: 'proposal1',
    followerConnection: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        endCursor: 'null',
      },
      totalCount: 0,
    },
  };
  const props = {
    className: '',
    referer: 'http://capco.test',
    oldProposal: {},
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
