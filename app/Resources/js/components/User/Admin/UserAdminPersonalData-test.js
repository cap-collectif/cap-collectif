/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock, formMock } from '../../../mocks';
import { UserAdminPersonalData } from './UserAdminPersonalData';

describe('<UserAdminPersonalData/>', () => {
  const props1 = {
    ...formMock,
    intl: intlMock,
  };

  const userIsConfirmed = {
    emailConfirmedAt: '2018-06-06 06:06:06',
  };

  const userIsNotConfirmed = {
    emailConfirmedAt: null,
  };

  it('should render when user is confirmed by email and viewer is super admin', () => {
    const wrapper = shallow(
      <UserAdminPersonalData {...props1} user={userIsConfirmed} isViewerOrSuperAdmin />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render when user is not confirmed by email and viewer is not super admin', () => {
    const wrapper = shallow(
      <UserAdminPersonalData {...props1} user={userIsNotConfirmed} isViewerOrSuperAdmin={false} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
