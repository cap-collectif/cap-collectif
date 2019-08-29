/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { EditProfileTabs } from './EditProfileTabs';
import { features } from '../../../redux/modules/default';

describe('<EditProfileTabs />', () => {
  const propsWithoutParis = {
    features: {
      ...features,
      profiles: true,
      login_paris: false,
    },
  };

  const propsWithParisAndNotProfiles = {
    features: {
      ...features,
      profiles: false,
      login_paris: true,
    },
  };

  const propsWithOpenIdAndNotProfiles = {
    features: {
      ...features,
      profiles: false,
      login_paris: false,
      login_openid: true,
    },
  };

  const viewer = {
    username: 'user',
    displayName: 'iAmAUser',
    media: {
      url: 'http://monimage.com/image1.jpg',
    },
    url: 'http://monprofil/profil',
  };

  it('should render all tabs', () => {
    const wrapper = shallow(<EditProfileTabs viewer={viewer} {...propsWithoutParis} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render all tabs except profile, password and account (Paris)', () => {
    const wrapper = shallow(<EditProfileTabs viewer={viewer} {...propsWithParisAndNotProfiles} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render all tabs except profile, password and account (OpenID)', () => {
    const wrapper = shallow(<EditProfileTabs viewer={viewer} {...propsWithOpenIdAndNotProfiles} />);
    expect(wrapper).toMatchSnapshot();
  });
});
