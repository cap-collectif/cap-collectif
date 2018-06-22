// @flow
import React from 'react';
import { Col } from 'react-bootstrap';
import UserPreview from './UserPreview';

type Props = {
  user?: ?Object,
  username?: ?string,
  className?: string,
};

class UserBox extends React.Component<Props> {
  static defaultProps = {
    user: null,
    username: null,
    className: '',
  };

  render() {
    const { user, username, className } = this.props;
    if (!user && !username) {
      return null;
    }
    return (
      <Col xs={12} sm={6} md={4} lg={3} className={className}>
        <UserPreview user={user} username={username} />
      </Col>
    );
  }
}

export default UserBox;
