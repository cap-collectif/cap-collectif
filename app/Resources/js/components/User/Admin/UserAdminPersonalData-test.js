/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock, formMock, $refType } from '../../../mocks';
import { UserAdminPersonalData } from './UserAdminPersonalData';

describe('<UserAdminPersonalData/>', () => {
  const props1 = {
    ...formMock,
    intl: intlMock,
  };

  const user = {
    $refType,
    id: '1',
    address: '45 rue Ginette Opet',
    address2: '12 boulevard Gisèle Mob',
    city: 'Montreuil',
    dateOfBirth: '12/12/2012',
    email: 'jp@laculisse.fr',
    emailConfirmationSentAt: '',
    firstname: 'Jean-Paul',
    lastname: 'LACULISSE',
    gender: 'MALE',
    isViewer: true,
    phone: '0666666666',
    phoneConfirmed: true,
    zipCode: '94560',
  };

  const userIsConfirmed = {
    ...user,
    isEmailConfirmed: true,
  };

  const userIsNotConfirmed = {
    ...user,
    isEmailConfirmed: false,
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
