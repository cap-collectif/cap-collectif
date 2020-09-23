// @flow
import * as React from 'react';
import { Popover } from 'react-bootstrap';
import IntlProvider from '../../startup/IntlProvider';

type Props = {|
  ...React.ElementProps<typeof Popover>,
  children: $FlowFixMe,
|};

export default ({ children, ...rest }: Props) => (
  // $FlowFixMe we have too different intl sources, react-intl and react-intl-redux, which brings conflicts
  <IntlProvider>
    <Popover {...rest}>{children}</Popover>
  </IntlProvider>
);
