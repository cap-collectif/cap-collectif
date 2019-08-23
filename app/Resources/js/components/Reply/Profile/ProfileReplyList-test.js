// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType, $fragmentRefs } from '../../../mocks';
import { ProfileReplyList } from './ProfileReplyList';

describe('<ProfileReplyList />', () => {
  const replies = {
    ...$refType,
    edges: [
      {
        node: {
          $fragmentRefs,
        },
      },
    ],
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProfileReplyList replies={replies} />);
    expect(wrapper).toMatchSnapshot();
  });
});
