// @flow
import * as React from 'react';
import { Popover } from 'react-bootstrap';
import IntlProvider from '../../startup/IntlProvider';

type Props = { children: React.Node };
export default ({ children, ...rest }: Props) => (
  <IntlProvider>
    <Popover {...rest}>{children}</Popover>
  </IntlProvider>
);
