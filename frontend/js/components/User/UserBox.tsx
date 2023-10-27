import React from 'react'
import { Col } from 'react-bootstrap'
import { graphql, createFragmentContainer } from 'react-relay'
import UserPreview from './UserPreview'
import type { UserBox_user } from '~relay/UserBox_user.graphql'

type Props = {
  id?: string | number
  user: UserBox_user | null | undefined
  className: string
}

class UserBox extends React.Component<Props> {
  static defaultProps = {
    className: '',
  }

  render() {
    const { user, className } = this.props
    return (
      <Col xs={12} sm={6} md={4} className={className}>
        <UserPreview user={user} />
      </Col>
    )
  }
}

export default createFragmentContainer(UserBox, {
  user: graphql`
    fragment UserBox_user on User {
      ...UserPreview_user
    }
  `,
})
