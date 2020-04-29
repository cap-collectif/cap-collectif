// @flow
import * as React from 'react';
import Providers from './Providers';
import { LanguageRedirectButton } from "~/components/LanguageButton/LanguageRedirectButton";
import type { Props } from "~/components/LanguageButton/LanguageRedirectButton";

export default (props: Props) => (
  <Providers>
      <LanguageRedirectButton {...props} />
    </Providers>
);
