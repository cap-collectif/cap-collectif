// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProfileComment } from './ProfileComment';
import { $fragmentRefs, $refType } from '../../mocks';

describe('<ProfileComment />', () => {
  it('should render correctly', () => {
    const comment = {
      id: 'comment1',
      author: {
        $fragmentRefs,
      },
      $fragmentRefs,
      $refType,
    };
    const wrapper = shallow(<ProfileComment comment={comment} />);
    expect(wrapper).toMatchSnapshot();
  });
});
