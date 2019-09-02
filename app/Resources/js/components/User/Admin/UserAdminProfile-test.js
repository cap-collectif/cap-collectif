/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock, formMock, $refType } from '../../../mocks';
import { UserAdminProfile } from './UserAdminProfile';

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
      url: 'perd.u',
      userType: { id: '1' },
      profilePageIndexed: true,
      neighborhood: 'neighborhood1',
    },
  };

  it('should render, with user confirmed by email adn viewer is super admin ', () => {
    const wrapper = shallow(
      <UserAdminProfile
        {...props1}
        userTypes={[{ id: 1, name: 'type_1' }]}
        features={{ user_type: true }}
        isViewerOrSuperAdmin
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render, with user not confirmed by email adn viewer not super admin', () => {
    const wrapper = shallow(
      <UserAdminProfile
        {...props1}
        userTypes={[{ id: 1, name: 'type_1' }]}
        features={{ user_type: false }}
        isViewerOrSuperAdmin={false}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
