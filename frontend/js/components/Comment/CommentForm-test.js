// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CommentForm } from './CommentForm';
import { formMock, intlMock, $refType } from '../../mocks';

const props = {
  ...formMock,
  isAnswer: false,
  comment: 'test of comment',
  commentable: { $refType, id: 'proposal1' },
  intl: intlMock,
};

const userProps = {
  user: {
    displayName: 'admin',
  },
};

describe('<CommentForm />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentForm {...props} user={null} />);
    wrapper.setState({ expanded: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with user', () => {
    const wrapper = shallow(<CommentForm {...props} {...userProps} />);
    wrapper.setState({ expanded: true });
    expect(wrapper).toMatchSnapshot();
  });
});
