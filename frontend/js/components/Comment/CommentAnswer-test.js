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
      $fragmentRefs,
      displayName: 'admin',
      vip: true,
    },
    id: 'proposalComment1',
  },
  useBodyColor: false,
};
describe('<CommentAnswer />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentAnswer {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
