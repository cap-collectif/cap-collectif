/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { NavbarRight } from './NavbarRight';
import { intlMock } from '../../mocks';
import { features } from '../../redux/modules/default';

export const user = {
  id: 'user1',
  username: 'admin',
  displayName: 'admin',
  email: 'admin@test.com',
  isEmailConfirmed: true,
  isPhoneConfirmed: true,
  newEmailToConfirm: null,
  phone: '0101010101',
  roles: [],
  uniqueId: 'admin',
  media: {
    url: 'https://source.unsplash.com/random/150x150',
  },
  _links: {
    profile: 'https://capco.dev/profile'
  },
  vip: false,
  isViewer: false,
  isAdmin: true,
    isEvaluerOnLegacyTool: true,
    isEvaluerOnNewTool: false,
};

const props = {
  currentLanguage: 'de',
  user: null,
  features,
  intl: intlMock,
  instanceName: 'dev',
  loginWithOpenId: false,
};

describe('<NavbarRight />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<NavbarRight {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render when authenticated', () => {
    const wrapper = shallow(<NavbarRight {...props} user={user} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with profile even with SSO for IDF', () => {
    const wrapper = shallow(<NavbarRight {...props} loginWithOpenId features={{...features, profiles: true}} user={user} instanceName="idf-bp-dedicated" />);
    expect(wrapper).toMatchSnapshot();
  });
});
