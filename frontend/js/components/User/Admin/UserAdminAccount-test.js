// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { UserAdminAccount } from './UserAdminAccount';
import { intlMock, formMock, $fragmentRefs, $refType } from '../../../mocks';

describe('<UserAdminAccount/>', () => {
  const props1 = {
    ...formMock,
    intl: intlMock,
  };
  it('should render when user is admin or viewer', () => {
    const userSubscribed = {
      $refType,
      id: 'user1',
      enabled: true,
      isViewer: true,
      locked: false,
      roles: [],
      vip: false,
      subscribedToNewsLetterAt: '2018-05-03 11:11:11',
      $fragmentRefs,
      isSubscribedToNewsLetter: true,
    };
    const wrapper = shallow(
      <UserAdminAccount {...props1} isViewerOrSuperAdmin user={userSubscribed} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render when user is not admin or viewer', () => {
    const userNotSubscribed = {
      $refType,
      $fragmentRefs,
      id: 'user1',
      enabled: true,
      isViewer: false,
      locked: false,
      roles: [],
      vip: false,
      subscribedToNewsLetterAt: null,
      isSubscribedToNewsLetter: false,
    };
    const wrapper = shallow(
      <UserAdminAccount {...props1} user={userNotSubscribed} isViewerOrSuperAdmin={false} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
