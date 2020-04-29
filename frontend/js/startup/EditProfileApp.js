// @flow
import * as React from 'react';
import Providers from './Providers';
import { EditProfileBox } from '../components/User/Profile/EditProfileBox';

export default (props: Object) => (
  <Providers>
      <EditProfileBox {...props} />
    </Providers>
);
