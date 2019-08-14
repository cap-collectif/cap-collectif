// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CommentListViewPaginated } from './CommentListViewPaginated';
import { $fragmentRefs, $refType, relayPaginationMock, intlMock } from '../../mocks';

const defaultComments = {
  totalCount: 2,
  edges: [
    {
      node: {
        $fragmentRefs,
        id: '1',
      },
    },
    {
      node: {
        $fragmentRefs,
        id: '2',
      },
    },
  ],
  pageInfo: {
    hasPreviousPage: true,
    hasNextPage: true,
    startCursor: 'string',
    endCursor: 'string',
  },
};

const defaultCommentable = {
  id: 'string',
  comments: defaultComments,
  $refType,
};

const defaultProps = {
  commentable: defaultCommentable,
  relay: relayPaginationMock,
  intl: intlMock,
  highlightedComment: 'string',
  useBodyColor: false,
};

describe('<CommentListViewPaginated />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentListViewPaginated {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render null with no comments', () => {
    const props = {
      ...defaultProps,
      commentable: {
        ...defaultCommentable,
        comments: {
          ...defaultComments,
          totalCount: 0,
        },
      },
    };
    const wrapper = shallow(<CommentListViewPaginated {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
