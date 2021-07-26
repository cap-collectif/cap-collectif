// @flow
import * as React from 'react';
import { Popover } from 'react-bootstrap';
// TODO https://github.com/cap-collectif/platform/issues/12148
// We should avoid doing this, but this add a failing test…
import Providers from '../../startup/Providers';

type Props = {|
  +id?: string,
  +placement?: 'top' | 'right' | 'bottom' | 'left',
  +positionTop?: string | number,
  +positionLeft?: string | number,
  +arrowOffsetTop?: string | number,
  +arrowOffsetLeft?: string | number,
  +title?: React.Node,
  +bsClass?: string,
  +className?: string,
  +children: React.Node | ?string,
|};

const CapcoPopover = ({ children, ...rest }: Props) => (
  <Providers>
    <Popover {...rest}>{children}</Popover>
  </Providers>
);

export default CapcoPopover;
