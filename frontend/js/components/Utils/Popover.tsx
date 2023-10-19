import * as React from 'react'
import { Popover } from 'react-bootstrap'
// TODO https://github.com/cap-collectif/platform/issues/12148
// We should avoid doing this, but this add a failing test…
import Providers from '../../startup/Providers'
type Props = {
  readonly id?: string
  readonly placement?: 'top' | 'right' | 'bottom' | 'left'
  readonly positionTop?: string | number
  readonly positionLeft?: string | number
  readonly arrowOffsetTop?: string | number
  readonly arrowOffsetLeft?: string | number
  readonly title?: JSX.Element | JSX.Element[] | string
  readonly bsClass?: string
  readonly className?: string
  readonly children: JSX.Element | JSX.Element[] | string | (string | null | undefined)
}

const CapcoPopover = ({ children, ...rest }: Props) => (
  <Providers>
    <Popover {...rest}>{children}</Popover>
  </Providers>
)

export default CapcoPopover
