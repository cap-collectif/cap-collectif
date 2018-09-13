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

describe('<CommentAnswers />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentAnswers {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
