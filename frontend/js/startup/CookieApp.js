// @flow
import * as React from 'react';
import Providers from './Providers';
import CookieModal from '../components/StaticPage/CookieModal';

export default (props: Object) => (
  <Providers>
    <CookieModal {...props} />
  </Providers>
);
