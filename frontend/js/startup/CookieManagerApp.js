// @flow
import * as React from 'react';
import Providers from './Providers';
import CookieManagerModal from '../components/StaticPage/CookieManagerModal';

export default (props: Object) => (
  <Providers>
    <CookieManagerModal {...props} />
  </Providers>
);
