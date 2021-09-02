// @flow
import * as React from 'react';
import Providers from './Providers';
import CookieContent from '../components/StaticPage/CookieContent';

export default (props: Object) => (
  <Providers>
    <CookieContent {...props} />
  </Providers>
);
