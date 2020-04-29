// @flow
import React from 'react';
import Providers from './Providers';
import { UserAdminPage, type Props } from '../components/User/Admin/UserAdminPage';

export default (props: Props) => (
  <Providers>
    <UserAdminPage {...props} />
  </Providers>
);
