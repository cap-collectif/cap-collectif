// @flow
import * as React from 'react';
import Providers from './Providers';
import PrivacyModal from '../components/StaticPage/PrivacyModal';

export default (props: Object) => (
  <Providers>
    <PrivacyModal {...props} />
  </Providers>
);
