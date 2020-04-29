// @flow
import * as React from 'react';
import Providers from './Providers';
import ParisUserNotValidModal from '../components/User/Profile/ParisUserNotValidModal';

export default (props: Object) => (
  <Providers>
    <ParisUserNotValidModal {...props} />
  </Providers>
);
