// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { cloneDeep } from 'lodash';
import { VoteListProfile } from './VoteListProfile';
import { relayPaginationMock, $refType, $fragmentRefs } from '../../mocks';

describe('<VoteListProfile />', () => {
  const defaultProps = {
    id: 'id1',
    relay: relayPaginationMock,
    voteList: {
      $refType,
      id: 'idvotelist',
      votes: {
        edges: [{ node: { id: 'node1', $fragmentRefs } }],
        totalCount: 3,
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: true,
          startCursor: '1',
          endCursor: '3',
        },
      },
    },
  };

  const nodes = [{ node: { id: '1', $fragmentRefs } }, { node: { id: '2', $fragmentRefs } }];

  const propsWithTwoNodes = cloneDeep(defaultProps);
  propsWithTwoNodes.voteList.votes.edges = nodes;

  const propsWithMore = cloneDeep(propsWithTwoNodes);
  propsWithMore.relay.hasMore = jest.fn();
  propsWithMore.relay.hasMore.mockReturnValueOnce(true).mockReturnValueOnce(false);

  it('renders correcty with empty node', () => {
    const wrapper = shallow(<VoteListProfile {...defaultProps} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty with two node', () => {
    const wrapperWithTwoNodes = shallow(<VoteListProfile {...propsWithTwoNodes} />);

    expect(wrapperWithTwoNodes).toMatchSnapshot();
  });

  it('renders two nodes and a loadmore button', () => {
    const wrapper = shallow(<VoteListProfile {...propsWithMore} />);

    expect(wrapper).toMatchSnapshot();

    wrapper.find('Button').simulate('click');

    propsWithMore.voteList.votes.edges = [
      { node: { id: '1', $fragmentRefs } },
      { node: { id: '2', $fragmentRefs } },
      { node: { id: '3', $fragmentRefs } },
    ];

    const wrapperAfterClick = shallow(<VoteListProfile {...propsWithMore} />);

    expect(wrapperAfterClick).toMatchSnapshot();
  });
});
