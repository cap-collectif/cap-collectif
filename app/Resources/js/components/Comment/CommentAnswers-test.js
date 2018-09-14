// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import CommentAnswers from './CommentAnswers';
import { $refType, $fragmentRefs } from '../../mocks';

const props = {
  comment: {
    $refType,
    id: 'proposalComment1',
    answers: {
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
    },
  },
};

const propsWithoutAnswers = {
  comment: {
    $refType,
    id: 'proposalComment2',
    answers: {
      totalCount: 0,
      edges: [],
    },
  },
};

describe('<CommentAnswers />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentAnswers {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with no answers', () => {
    const wrapper = shallow(<CommentAnswers {...propsWithoutAnswers} />);
    expect(wrapper).toMatchSnapshot();
  });
});
