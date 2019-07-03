// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { UserAvatarList } from './UserAvatarList';

describe('<ProjectHeaderAuthors />', () => {
  it('renders correctly', () => {
    const props = {
        id
        publishedAt: '12/08/1664',
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
});
