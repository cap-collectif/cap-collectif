import React, { PureComponent } from 'react'
import { Media as MediaBtsp } from 'react-bootstrap'

type Props = {
  children?: any
}

export default class Left extends PureComponent<Props> {
  render() {
    const { children } = this.props
    return <MediaBtsp.Left>{children}</MediaBtsp.Left>
  }
}
