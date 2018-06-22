// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalVotes } from './ProposalVotes';
import { $refType, relayPaginationMock } from '../../../mocks';

describe('<ProposalVotes />', () => {
  const props = {
    proposal: {
      $refType,
      id: '1',
      votes: {
        edges: [
          {
            cursor: 'N0aW9uOjE=',
            node: {
              author: {
                show_url: '',
                id: 'userAdmin',
                displayName: 'Admin',
                contributionsCount: 3,
                username: 'A',
                media: {
                  url: 'google.com/lorem.jpg',
                },
              },
            },
          },
          {
            cursor: 'N0aW9uOjE=',
            node: {
              author: {
                show_url: '',
                id: 'userJean',
                displayName: 'Jean',
                contributionsCount: 3,
                username: 'J',
                media: {
                  url: 'google.com/lorem.jpg',
                },
              },
            },
          },
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
