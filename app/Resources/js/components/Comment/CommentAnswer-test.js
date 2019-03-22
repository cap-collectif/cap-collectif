// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CommentAnswer } from './CommentAnswer';
import { $refType, $fragmentRefs } from '../../mocks';

const props = {
  comment: {
    $refType,
    $fragmentRefs,
    author: {
      displayName: 'admin',
      media: null,
      vip: true,
    },
    id: 'proposalComment1',
  },
};
describe('<CommentAnswer />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentAnswer {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
