// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { relayPaginationMock, $refType, $fragmentRefs } from '../../mocks';
import { OpinionFollowersBox } from './OpinionFollowersBox';

describe('<OpinionFollowersBox />', () => {
  const props = {
    relay: relayPaginationMock,
    opinion: {
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
    const wrapper = shallow(<OpinionFollowersBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
