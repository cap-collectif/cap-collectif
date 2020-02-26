// @flow
import * as React from 'react';
import { Popover } from 'react-bootstrap';
import IntlProvider from '../../startup/IntlProvider';

type Props = {|
  ...React.ElementProps<typeof Popover>,
  children: $FlowFixMe,
|};

export default ({ children, ...rest }: Props) => (
  <IntlProvider>
    <Popover {...rest}>{children}</Popover>
  </IntlProvider>
);
