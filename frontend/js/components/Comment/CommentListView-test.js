// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CommentListView } from './CommentListView';
import { $fragmentRefs, $refType, relayRefetchMock } from '../../mocks';

const defaultProps = {
  isAuthenticated: false,
  commentable: { $fragmentRefs, $refType, id: '1' },
  order: 'last',
  relay: relayRefetchMock,
  useBodyColor: false,
};

const defaultState = {
  isRefetching: false,
  highlightedComment: null,
};

describe('<CommentListView />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentListView {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when refecting', () => {
    const state = {
      ...defaultState,
      isRefetching: true,
    };
    const wrapper = shallow(<CommentListView {...defaultProps} />);
    wrapper.setState(state);
    expect(wrapper).toMatchSnapshot();
  });
});
