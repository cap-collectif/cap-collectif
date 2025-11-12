// @ts-nocheck
import * as React from 'react';
import Providers from './Providers';
import FooterWrapperLegacy from '~/components/Footer/FooterWrapperLegacy';

export default (props: Record<string, any>) => (
  <Providers designSystem>
    <FooterWrapperLegacy {...props} />
  </Providers>
);
