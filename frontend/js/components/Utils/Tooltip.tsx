import * as React from 'react'
import { Tooltip } from 'react-bootstrap'
// TODO https://github.com/cap-collectif/platform/issues/12148
// We should avoid doing this.
import Providers from '../../startup/Providers'

type Props = React.ElementProps<typeof Tooltip> & {
  children: JSX.Element | JSX.Element[] | string | (string | null | undefined)
}
export default ({ children, ...rest }: Props) => (
  <Providers>
    <Tooltip {...rest}>{children}</Tooltip>
  </Providers>
)
