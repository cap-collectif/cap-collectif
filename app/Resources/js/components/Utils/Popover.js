// @flow
import * as React from 'react';
import { Popover, type PopoverProps } from 'react-bootstrap';
import IntlProvider from '../../startup/IntlProvider';

type Props = {|
  ...PopoverProps,
  children: $FlowFixMe,
|};

export default ({ children, ...rest }: Props) => (
  <IntlProvider>
    <Popover {...rest}>{children}</Popover>
  </IntlProvider>
);
