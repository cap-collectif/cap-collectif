// @flow
import * as React from 'react';
import { Popover } from 'react-bootstrap';
// TODO https://github.com/cap-collectif/platform/issues/12148
// We should avoid doing this.
import Providers from '../../startup/Providers';

type Props = {|
  ...React.ElementProps<typeof Popover>,
  +children: React.Node | ?string,
|};

export default ({ children, ...rest }: Props) => (
  <Providers>
    <Popover {...rest}>{children}</Popover>
  </Providers>
);
