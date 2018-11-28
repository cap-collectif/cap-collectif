// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { UserInGroupModal } from './UserInGroupModal';
import { $refType, relayPaginationMock, intlMock } from '../../../mocks';

describe('<UserInGroupModal />', () => {
  const noUser = {
    id: 'group1',
    title: 'Mon super groupe 1',
    users: {
      edges: [],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: false,
        startCursor: 'null',
        endCursor: 'null',
      },
      totalCount: 0,
    },
    $refType,
  };

  const twoUsers = {
    id: 'group2',
    title: 'Mon super groupe 2',
    users: {
      edges: [
        {
          cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          node: {
            id: 'user1',
            username: 'Perlinpinpin',
            show_url: 'http://poudre.de/perlinpinpin',
            media: {
              id: 'media1',
              name: 'perl1',
              size: '45px',
              url: 'http://poudre.de/perlinpinpin.jpg',
            },
          },
        },
        {
          cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          node: {
            id: 'user2',
            username: 'Toto',
            show_url: 'htp://toto.com',
            media: {
              id: 'media2',
              name: 'toto',
              size: '45px',
              url: 'http://toto.com/image.jpg',
            },
          },
        },
      ],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: false,
        startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
      },
      totalCount: 2,
    },
    $refType,
  };
  const twoUsersWithNextPage = {
    id: 'group2',
    title: 'Mon super groupe 2',
    users: {
      edges: [
        {
          cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          node: {
            id: 'user1',
            username: 'Perlinpinpin',
            show_url: 'http://poudre.de/perlinpinpin',
            media: {
              id: 'media1',
              name: 'perl1',
              size: '45px',
              url: 'http://poudre.de/perlinpinpin.jpg',
            },
          },
        },
        {
          cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          node: {
            id: 'user2',
            username: 'Toto',
            show_url: 'htp://toto.com',
            media: {
              id: 'media2',
              name: 'toto',
              size: '45px',
              url: 'http://toto.com/image.jpg',
            },
          },
        },
      ],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: true,
        startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
      },
      totalCount: 2,
    },
    $refType,
  };

  const intl = {
    intl: intlMock,
  };

  it('should render correctly without user in group', () => {
    const wrapper = shallow(
      <UserInGroupModal
        group={noUser}
        show={false}
        handleClose={() => {}}
        relay={relayPaginationMock}
        {...intl}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with user in 2 groups', () => {
    const wrapper = shallow(
      <UserInGroupModal
        group={twoUsers}
        show
        handleClose={() => {}}
        relay={relayPaginationMock}
        {...intl}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with user in load more', () => {
    const wrapper = shallow(
      <UserInGroupModal
        group={twoUsersWithNextPage}
        show
        handleClose={() => {}}
        relay={{ ...relayPaginationMock, hasMore: () => true }}
        {...intl}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
