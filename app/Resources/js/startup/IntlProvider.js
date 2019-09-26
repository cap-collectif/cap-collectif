// @flow
import * as React from 'react';
import { IntlProvider, type IntlShape } from 'react-intl-redux';

// eslint-disable-next-line no-console
const onError = e => console.log(e);

type Props = {|
  ...IntlShape,
  children: React.Node,
|};

export default ({ children }: Props) => (
  <IntlProvider textComponent="span" onError={onError}>
    {children}
  </IntlProvider>
);
