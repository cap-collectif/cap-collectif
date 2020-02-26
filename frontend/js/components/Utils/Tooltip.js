// @flow
import * as React from 'react';
import { Tooltip } from 'react-bootstrap';
import IntlProvider from '../../startup/IntlProvider';

type Props = {|
  ...React.ElementProps<typeof Tooltip>,
  children: $FlowFixMe,
|};

export default ({ children, ...rest }: Props) => (
  <IntlProvider>
    <Tooltip {...rest}>{children}</Tooltip>
  </IntlProvider>
);
