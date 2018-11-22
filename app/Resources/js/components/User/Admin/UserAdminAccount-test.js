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
  it('should render when user is admin or viewer', () => {
    const userSubscribed = {
      subscribedToNewsLetterAt: '2018-05-03 11:11:11',
    };
    const wrapper = shallow(
      <UserAdminAccount
        {...props1}
        isViewerOrSuperAdmin
        user={userSubscribed}
        userDeletedIsNotViewer
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render when user is not admin or viewer', () => {
    const userNotSubscribed = {
      subscribedToNewsLetterAt: null,
    };
    const wrapper = shallow(
      <UserAdminAccount
        {...props1}
        user={userNotSubscribed}
        isViewerOrSuperAdmin={false}
        userDeletedIsNotViewer={false}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
