// @flow
import * as React from 'react';
import Providers from './Providers';
import LanguageRedirectButton, {
  type Props,
} from '~/components/LanguageButton/LanguageRedirectButton';

export default (props: Props) => (
  <Providers>
    <LanguageRedirectButton {...props} />
  </Providers>
);
