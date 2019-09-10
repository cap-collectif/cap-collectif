// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CommentInfos } from './CommentInfos';
import { $fragmentRefs, $refType } from '../../mocks';

const defaultAuthor = {
  $fragmentRefs,
  displayName: 'Pipoudou',
  url: 'https://aa.com/',
};

const defaultComment = {
  $refType,
  $fragmentRefs,
  authorName: 'Poupidou',
  author: defaultAuthor,
  pinned: false,
};

const defaultProps = {
  comment: defaultComment,
};

describe('<CommentInfos />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentInfos {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with no author', () => {
    const props = {
      ...defaultProps,
      comment: {
        ...defaultComment,
        author: null,
      },
    };
    const wrapper = shallow(<CommentInfos {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
