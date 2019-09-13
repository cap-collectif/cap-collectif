// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { relayPaginationMock, $refType, $fragmentRefs } from '../../mocks';
import { OpinionVersionFollowersBox } from './OpinionVersionFollowersBox';

describe('<OpinionVersionFollowersBox />', () => {
  const props = {
    relay: relayPaginationMock,
    version: {
      id: 'version',
      $refType,
      followers: {
        edges: [
          {
            cursor: 'cursor1',
            node: {
              $fragmentRefs,
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'cursor1',
        },
        totalCount: 1,
      },
    },
  };

  it('should render correctly', () => {
    const wrapper = shallow(<OpinionVersionFollowersBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
