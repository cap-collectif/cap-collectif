// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { cloneDeep } from 'lodash';
import { VoteListProfile } from './VoteListProfile';
import { relayPaginationMock, $refType } from '../../mocks';

describe('<VoteListProfile />', () => {
  const defaultProps = {
    id: 'id1',
    relay: relayPaginationMock,
    voteList: {
      id: 'idvotelist',
      votes: {
        edges: [],
        totalCount: 3,
        pageInfo: {
          hasPreviousPage: $refType,
          hasNextPage: $refType,
          startCursor: $refType,
          endCursor: $refType,
        },
      },
    },
  };

  const nodes = [{ node: { id: '1' } }, { node: { id: '2' } }];

  const propsWithTwoNodes = cloneDeep(defaultProps);
  propsWithTwoNodes.voteList.votes.edges = nodes;

  const propsWithMore = cloneDeep(propsWithTwoNodes);
  propsWithMore.relay.hasMore = jest.fn();
  propsWithMore.relay.hasMore.mockReturnValueOnce(true).mockReturnValueOnce(false);

  it('renders correcty with empty node', () => {
    // $FlowFixMe
    const wrapper = shallow(<VoteListProfile {...defaultProps} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty with two node', () => {
    // $FlowFixMe
    const wrapperWithTwoNodes = shallow(<VoteListProfile {...propsWithTwoNodes} />);

    expect(wrapperWithTwoNodes).toMatchSnapshot();
  });

  it('renders two nodes and a loadmore button', () => {
    // $FlowFixMe
    const wrapper = shallow(<VoteListProfile {...propsWithMore} />);

    expect(wrapper).toMatchSnapshot();

    wrapper.find('a').simulate('click');

    propsWithMore.voteList.votes.edges = [
      { node: { id: '1' } },
      { node: { id: '2' } },
      { node: { id: '3' } },
    ];
    // $FlowFixMe
    const wrapperAfterClick = shallow(<VoteListProfile {...propsWithMore} />);

    expect(wrapperAfterClick).toMatchSnapshot();
  });
});
