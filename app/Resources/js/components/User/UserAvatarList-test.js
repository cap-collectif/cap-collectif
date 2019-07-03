// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { UserAvatarList } from './UserAvatarList';

describe('<UserAvatarList />', () => {
  it('renders correctly', () => {
    const props = {
      max: 10,
      users: [{
        username: 'toto',
        media: {
          url: 'http://media12/profileAvatar.jpg',
        },
        _links: {
          profile: 'http://jesuistoto.com',
        },
      }]
    };
    const wrapper = shallow(<UserAvatarList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly withou authors', () => {
    const props = {
      max: 10,
      users: []
    };
    const wrapper = shallow(<UserAvatarList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
