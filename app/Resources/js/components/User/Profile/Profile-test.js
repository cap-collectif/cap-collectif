/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Profile } from './Profile';

describe('<Profile />', () => {
  const props = {
    initialValues: {
      media: {
        id: 'media1',
        name: 'media1',
        size: '128*128',
        url: 'http://imgur.com/15645613.jpg',
      },
      show_url: 'http://linkedin.com/user/dqkfjdsmq',
      username: 'username',
      biography: 'I am a fucking customer',
      website: 'http://perdu.com',
      facebookUrl: 'https://facebokk.com/mmm',
      linkedInUrl: 'http://linkedin.com/neurchi',
      twitterUrl: 'http://twitter.com/cuicui',
      profilePageIndexed: false,
      userType: 1,
      neighborhood: 'DTC',
    },
  };

  const viewer = {
    id: 'user1234',
    media: {
      id: 'media1',
      name: 'media1',
      size: '128*128',
      url: 'http://imgur.com/15645613.jpg',
    },
    show_url: 'http://linkedin.com/user/dqkfjdsmq',
    username: 'username',
    biography: 'I am a fucking customer',
    website: 'http://perdu.com',
    facebookUrl: 'https://facebokk.com/mmm',
    linkedInUrl: 'http://linkedin.com/neurchi',
    twitterUrl: 'http://twitter.com/cuicui',
    profilePageIndexed: false,
    userType: {
      id: 1,
    },
    neighborhood: 'DTC',
  };

  it('should render my profile', () => {
    const wrapper = shallow(
      <Profile viewer={viewer} userTypes={[{ id: 1, name: 'type_1' }]} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
