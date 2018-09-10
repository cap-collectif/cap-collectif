// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { cloneDeep } from 'lodash';
import { ArgumentListProfile } from './ArgumentListProfile';
import { relayPaginationMock } from '../../mocks';

describe('<ArgumentListProfile />', () => {
  const defaultProps = {
    relay: relayPaginationMock,
    argumentList: {
      id: 'idarguments',
      arguments: {
        edges: [],
      },
    },
  };

  const nodes = [{ node: { id: '1' } }, { node: { id: '2' } }];

  const propsWithTwoNodes = cloneDeep(defaultProps);
  propsWithTwoNodes.argumentList.arguments.edges = nodes;

  const propsWithMore = cloneDeep(propsWithTwoNodes);
  propsWithMore.relay.hasMore = jest.fn();
  propsWithMore.relay.hasMore.mockReturnValueOnce(true).mockReturnValueOnce(false);

  it('renders correcty with empty node', () => {
    // $FlowFixMe
    const wrapper = shallow(<ArgumentListProfile {...defaultProps} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty with two nodes', () => {
    // $FlowFixMe
    const wrapper = shallow(<ArgumentListProfile {...propsWithTwoNodes} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders two nodes and a loadmore button', () => {
    // $FlowFixMe
    const wrapper = shallow(<ArgumentListProfile {...propsWithMore} />);

    expect(wrapper).toMatchSnapshot();

    wrapper.find('a').simulate('click');

    propsWithMore.argumentList.arguments.edges = [
      { node: { id: '1' } },
      { node: { id: '2' } },
      { node: { id: '3' } },
    ];
    // $FlowFixMe
    const wrapperAfterClick = shallow(<ArgumentListProfile {...propsWithMore} />);

    expect(wrapperAfterClick).toMatchSnapshot();
  });
});
