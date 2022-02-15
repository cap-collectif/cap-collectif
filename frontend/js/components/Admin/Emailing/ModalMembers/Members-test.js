// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { Members } from './Members';
import { $refType, relayPaginationMock } from '~/mocks';

const baseProps = {
  mailingList: {
    $refType,
    id: 'mailingList-123',
    allMembers: {
      totalCount: 2,
    },
    members: {
      totalCount: 2,
      pageInfo: {
        hasNextPage: true,
      },
      edges: [
        {
          node: {
            id: 'user-123',
            email: 'jean@cap-collectif.com',
            username: 'jean',
          },
        },
        {
          node: {
            id: 'user-456',
            email: 'jean-peut-plus@cap-collectif.com',
            username: 'jpp',
          },
        },
      ],
    },
  },
  isAdmin: true,
  relay: relayPaginationMock,
};

const props = {
  basic: baseProps,
};

describe('<Members />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Members {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });
});
