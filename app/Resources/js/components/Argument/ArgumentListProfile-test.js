// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { cloneDeep } from 'lodash';
import { ArgumentListProfile } from './ArgumentListProfile';
import { relayPaginationMock, $refType, $fragmentRefs } from '../../mocks';

describe('<ArgumentListProfile />', () => {
  const defaultProps = {
    relay: relayPaginationMock,
    argumentList: {
      $refType,
      id: 'idarguments',
      arguments: {
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: true,
          startCursor: '1',
          endCursor: '3',
        },
        totalCount: 3,
        edges: [],
      },
    },
  };

  const nodes = [{ node: { id: '1', $fragmentRefs } }, { node: { id: '2', $fragmentRefs } }];

  const propsWithTwoNodes = cloneDeep(defaultProps);
  propsWithTwoNodes.argumentList.arguments.edges = nodes;

  const propsWithMore = cloneDeep(propsWithTwoNodes);
  propsWithMore.relay.hasMore = jest.fn();
  propsWithMore.relay.hasMore.mockReturnValueOnce(true).mockReturnValueOnce(false);

  it('renders correcty with empty node', () => {
    const wrapper = shallow(<ArgumentListProfile {...defaultProps} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty with two nodes', () => {
    const wrapper = shallow(<ArgumentListProfile {...propsWithTwoNodes} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders two nodes and a loadmore button', () => {
    const wrapper = shallow(<ArgumentListProfile {...propsWithMore} />);

    expect(wrapper).toMatchSnapshot();

    wrapper.find('Button').simulate('click');

    propsWithMore.argumentList.arguments.edges = [
      { node: { id: '1', $fragmentRefs } },
      { node: { id: '2', $fragmentRefs } },
      { node: { id: '3', $fragmentRefs } },
    ];
    const wrapperAfterClick = shallow(<ArgumentListProfile {...propsWithMore} />);

    expect(wrapperAfterClick).toMatchSnapshot();
  });
});
