// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CommentBody } from './CommentBody';
import { $refType } from '../../mocks';

const comment = {
  $refType,
  body: 'lol',
  trashed: false,
  trashedReason: 'mdr',
};

describe('<CommentBody />', () => {
  it('should render correctly', () => {
    const props = {
      comment,
    };
    const wrapper = shallow(<CommentBody {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when trashed with body', () => {
    const props = {
      comment: {
        ...comment,
        trashed: true,
      },
    };
    const wrapper = shallow(<CommentBody {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
