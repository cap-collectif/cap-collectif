// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { UserGroupModal } from './UserGroupModal';
import { $fragmentRefs, $refType, relayPaginationMock, intlMock } from '../../../mocks';

describe('<UserGroupModal />', () => {
  const noGroup = {
    id: 'UHJvamVjdDpwcm9qZWN0MQ==',
    restrictedViewers: {
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

  const twoGroups = {
    id: 'project2',
    restrictedViewers: {
      edges: [
        $fragmentRefs,
        {
          cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          node: {
            id: 'group2',
            title: 'Un groupe cool',
            $fragmentRefs,
          },
        },
        {
          cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          node: {
            id: 'group3',
            title: 'mon super groupe 2',
            $fragmentRefs,
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

  const intl = {
    intl: intlMock,
  };

  it('should render correctly without group', () => {
    const wrapper = shallow(
      <UserGroupModal
        {...intl}
        project={noGroup}
        show={false}
        handleClose={() => {}}
        relay={relayPaginationMock}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with 2 groups', () => {
    const wrapper = shallow(
      <UserGroupModal
        {...intl}
        project={twoGroups}
        show
        handleClose={() => {}}
        relay={relayPaginationMock}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with load more', () => {
    const wrapper = shallow(
      <UserGroupModal
        {...intl}
        project={twoGroups}
        show
        handleClose={() => {}}
        relay={{ ...relayPaginationMock, hasMore: () => true }}
      />,
    );
    wrapper.setState({
      currentShownGroupModalId: 'group9',
    });
    expect(wrapper).toMatchSnapshot();
  });
});
