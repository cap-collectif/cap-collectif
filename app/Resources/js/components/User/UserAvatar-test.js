// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { UserAvatar } from './UserAvatar';
import { features } from '../../redux/modules/default';

describe('<UserAvatar />', () => {
  it('renders correctly', () => {
    const props = {
      features,
      user: {
        username: 'toto',
        media: {
          url: 'http://media12/profileAvatar.jpg',
        },
      },
      size: 16,
      className: 'mr-10',
      anchor: true,
    };
    const wrapper = shallow(<UserAvatar {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly user without avatar', () => {
    const props = {
      features,
      user: {
        username: 'toto',
        media: null,
      },
      size: 16,
    };
    const wrapper = shallow(<UserAvatar {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with custom default avatar', () => {
    const props = {
      features,
      user: {
        username: 'toto',
        media: null,
      },
      defaultAvatar: 'http://avatar/customAvatar.jpg',
      size: 16,
    };
    const wrapper = shallow(<UserAvatar {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
