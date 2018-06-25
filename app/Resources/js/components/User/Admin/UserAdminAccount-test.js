/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { UserAdminAccount } from './UserAdminAccount';
import { intlMock, formMock } from '../../../mocks';

describe('<UserAdminAccount/>', () => {
  const props1 = {
    ...formMock,
    intl: intlMock,
  };

  const userExpiredAndSubscribed = {
    subscribedToNewsLetterAt: '2018-05-03 11:11:11',
    expiresAt: '2018-06-03 11:11:11',
  };

  const userNotExpiredAndNotSubscribed = {
    subscribedToNewsLetterAt: null,
    expiresAt: null,
  };
  it('should render with user is admin or viewer', () => {
    const wrapper = shallow(
      <UserAdminAccount
        {...props1}
        isViewerOrSuperAdmin
        user={userExpiredAndSubscribed}
        userDeletedIsNotViewer
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with user is not admin or viewer ', () => {
    const wrapper = shallow(
      <UserAdminAccount
        {...props1}
        user={userNotExpiredAndNotSubscribed}
        isViewerOrSuperAdmin={false}
        userDeletedIsNotViewer={false}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
