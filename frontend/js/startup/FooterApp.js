// @flow
import * as React from 'react';
import Providers from './Providers';
import Footer from '../components/Footer/Footer';

export default (props: Object) => (
  <Providers>
      <Footer {...props} />
    </Providers>
);
