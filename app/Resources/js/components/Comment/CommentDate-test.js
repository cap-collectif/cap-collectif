// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import CommentDate from './CommentDate';
import { $refType } from '../../mocks';

const defaultComment = {
  $refType,
  createdAt: '2018-01-02',
  updatedAt: '2018-08-02',
  publishedAt: '2018-11-02',
};

const defaultProps = {
  body: 'lol',
  trashed: false,
};

describe('<CommentDate />', () => {
  it('should render correctly', () => {
    const props = {
      ...defaultProps,
      comment: defaultComment,
    };
    const wrapper = shallow(<CommentDate {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render null with createdAt > publishedAt', () => {
    const props = {
      ...defaultProps,
      comment: {
        ...defaultComment,
        createdAt: '2019-08-02',
      },
    };
    const wrapper = shallow(<CommentDate {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with trashed false', () => {
    const props = {
      ...defaultProps,
      trashed: false,
      comment: defaultComment,
    };
    const wrapper = shallow(<CommentDate {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
