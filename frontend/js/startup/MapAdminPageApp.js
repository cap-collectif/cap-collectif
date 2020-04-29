// @flow
import React from 'react';
import Providers from './Providers';
import MapAdminPage from '../components/User/Admin/MapAdminPage';

export default (props: {}) => (
  <Providers>
      <MapAdminPage {...props} />
    </Providers>
);
