// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { UserAvatarDeprecated } from './UserAvatarDeprecated';

describe('<UserAvatarDeprecated />', () => {
  it('renders correctly', () => {
    const props = {
      user: {
        username: 'toto',
        media: {
          url: 'http://media12/profileAvatar.jpg',
        },
        _links: {
          profile: 'http://jesuistoto.com',
        },
      },
      size: 16,
      className: 'mr-10',
      anchor: true,
      onBlur: () => {
        console.log('onBlur');
      },
      onFocus: () => {
        console.log('onFocus');
      },
      onMouseOver: () => {
        console.log('onMouseOver');
      },
      onMouseOut: () => {
        console.log('onMouseOut');
      },
    };
    const wrapper = shallow(<UserAvatarDeprecated {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly user without avatar', () => {
    const props = {
      user: {
        username: 'toto',
        _links: {
          profile: 'http://jesuistoto.com',
        },
        media: null,
      },
      size: 16,
    };
    const wrapper = shallow(<UserAvatarDeprecated {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with custom default avatar', () => {
    const props = {
      user: {
        username: 'toto',
        _links: {
          profile: 'http://jesuistoto.com',
        },
        media: null,
      },
      defaultAvatar: 'http://avatar/customAvatar.jpg',
      size: 16,
    };
    const wrapper = shallow(<UserAvatarDeprecated {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
