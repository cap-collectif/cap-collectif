// @flow
import * as React from 'react';
import Providers from './Providers';
import ChooseAUsernameModal from '../components/User/Profile/ChooseAUsernameModal';

export default (props: Object) => (
  <Providers>
      <ChooseAUsernameModal {...props} />
    </Providers>
);
