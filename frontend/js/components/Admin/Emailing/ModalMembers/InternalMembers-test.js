// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { InternalMembers } from './InternalMembers';
import { $refType, relayPaginationMock } from '~/mocks';

const baseProps = {
  query: {
    $refType,
    refusingMembers: {
      totalCount: 0,
    },
    members: {
      pageInfo: {
        hasNextPage: true,
      },
      edges: [
        {
          node: {
            id: 'user-123',
            email: 'jean@cap-collectif.com',
          },
        },
        {
          node: {
            id: 'user-456',
            email: 'jean-peut-plus@cap-collectif.com',
          },
        },
      ],
    },
  },
  relay: relayPaginationMock,
};

const props = {
  basic: baseProps,
};

describe('<InternalMembers />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<InternalMembers {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });
});
