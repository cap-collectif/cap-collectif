// @flow
import React from 'react';
import Providers from './Providers';
import LocaleAdminPage from '../components/Admin/Locale/LocaleAdminPage';

export default (props: {}) => (
  <Providers>
      <LocaleAdminPage {...props} />
    </Providers>
);
