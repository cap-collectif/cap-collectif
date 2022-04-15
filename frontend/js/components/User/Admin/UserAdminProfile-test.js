/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock, formMock, $refType } from '~/mocks';
import { UserAdminProfile } from './UserAdminProfile';
import { disableFeatureFlags, enableFeatureFlags } from '~/testUtils';

describe('<UserAdminProfile/>', () => {
  const props1 = {
    ...formMock,
    intl: intlMock,
    hasValue: {},
    user: {
      $refType,
      id: '1',
      biography: '',
      isViewer: true,
      linkedInUrl: '',
      media: null,
      username: 'user1',
      websiteUrl: 'perd.u',
      facebookUrl: 'perd.u',
      twitterUrl: 'perd.u',
      instagramUrl: 'perd.u',
      url: 'perd.u',
      userType: { id: '1' },
      profilePageIndexed: true,
      neighborhood: 'neighborhood1',
    },
    viewer: {
      $refType,
      isSuperAdmin: true,
    },
  };
  afterEach(() => {
    disableFeatureFlags();
  });
  it('should render, with user confirmed by email adn viewer is super admin ', () => {
    enableFeatureFlags(['user_type', 'noindex_on_profiles']);
    const wrapper = shallow(
      <UserAdminProfile {...props1} userTypes={[{ id: 1, name: 'type_1' }]} isViewerOrSuperAdmin />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render, with user not confirmed by email adn viewer not super admin', () => {
    const wrapper = shallow(
      <UserAdminProfile
        {...props1}
        userTypes={[{ id: 1, name: 'type_1' }]}
        isViewerOrSuperAdmin={false}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
