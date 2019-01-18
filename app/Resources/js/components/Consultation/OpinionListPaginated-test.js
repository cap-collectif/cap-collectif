// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionListPaginated } from './OpinionListPaginated';
import { $refType, $fragmentRefs, relayPaginationMock } from '../../mocks';

describe('<OpinionListPaginated />', () => {
  const props = {
    relay: { ...relayPaginationMock, hasMore: () => true },
    section: {
      $refType,
      id: 'section1',
      opinions: {
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: 'cursor1',
          endCursor: null,
        },
        edges: [
          { node: { id: 'opinion1', $fragmentRefs } },
          { node: { id: 'opinion2', $fragmentRefs } },
          { node: { id: 'opinion3', $fragmentRefs } },
        ],
      },
    },
  };

  it('renders correcty with pagination disabled', () => {
    const wrapper = shallow(<OpinionListPaginated {...props} enablePagination={false} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty with pagination enabled', () => {
    const wrapper = shallow(<OpinionListPaginated {...props} enablePagination />);
    expect(wrapper).toMatchSnapshot();
    wrapper.find('#OpinionListPaginated-loadmore').simulate('click');
    expect(wrapper).toMatchSnapshot();
  });
});
