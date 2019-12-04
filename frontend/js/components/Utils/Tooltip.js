// @flow
import * as React from 'react';
import { Tooltip, type TooltipProps } from 'react-bootstrap';
import IntlProvider from '../../startup/IntlProvider';

type Props = {|
  ...TooltipProps,
  children: $FlowFixMe,
|};

export default ({ children, ...rest }: Props) => (
  <IntlProvider>
    <Tooltip {...rest}>{children}</Tooltip>
  </IntlProvider>
);
