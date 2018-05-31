/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { Profile } from './Profile';
import { intlMock, formMock } from '../../../mocks';

describe('<Profile />', () => {
  const props = {
    ...formMock,
    intl: intlMock,
    hasValue: {},
    profileForm: {},
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
    features: {
      user_type: true,
    },
  };

  const props2 = {
    ...formMock,
    intl: intlMock,
    hasValue: {},
    profileForm: {},
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
    features: {
      user_type: false,
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

  it('should render my profile with features user_type', () => {
    const wrapper = shallow(
      <Profile viewer={viewer} userTypes={[{ id: 1, name: 'type_1' }]} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render my profile without features user_type', () => {
    const wrapper = shallow(
      <Profile viewer={viewer} userTypes={[{ id: 1, name: 'type_1' }]} {...props2} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
