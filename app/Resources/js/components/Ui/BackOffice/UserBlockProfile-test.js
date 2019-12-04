// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { UserBlockProfile } from './UserBlockProfile';

describe('<UserBlockProfile />', () => {
  it('renders correctly', () => {
    const props = {
      userName: 'Aya Nakamura',
      userImage: '/profile.png',
      profileUrl: '/profile/edit.html',
    };
    const wrapper = shallow(<UserBlockProfile {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
