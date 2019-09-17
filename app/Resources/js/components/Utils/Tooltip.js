// @flow
import * as React from 'react';
import { Tooltip } from 'react-bootstrap';
import IntlProvider from '../../startup/IntlProvider';

type Props = { children: any };
export default ({ children, ...rest }: Props) => (
  <IntlProvider>
    <Tooltip {...rest}>{children}</Tooltip>
  </IntlProvider>
);
