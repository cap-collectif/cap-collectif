// @flow
import * as React from 'react';
import { IntlProvider } from 'react-intl-redux';
import { type IntlShape } from 'react-intl';
// eslint-disable-next-line no-console
const onError = e => console.log(e);

type Props = {|
  // $FlowFixMe we have too different intl sources, react-intl and react-intl-redux, which brings conflicts
  ...IntlShape,
  timeZone: string,
  children: React.Node,
|};

export default ({ children }: Props) => (
  <IntlProvider textComponent="span" onError={onError}>
    {children}
  </IntlProvider>
);
