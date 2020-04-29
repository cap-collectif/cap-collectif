// @flow
import React from 'react';
import Providers from './Providers';
import { GroupAdminPage, type Props } from '../components/Group/Admin/GroupAdminPage';

export default (props: Props) => (
  <Providers>
      <GroupAdminPage {...props} />
    </Providers>
);
