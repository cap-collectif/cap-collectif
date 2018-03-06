import React from 'react';
import { Col } from 'react-bootstrap';
import UserPreview from './UserPreview';

const UserBox = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    username: React.PropTypes.string,
    className: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      user: null,
      username: null,
      className: ''
    };
  },

  render() {
    const { user, username, className } = this.props;
    if (!user && !username) {
      return null;
    }
    return (
      <Col xs={12} sm={6} md={4} lg={3} className={className}>
        <UserPreview className="block block--bordered" user={user} username={username} />
      </Col>
    );
  }
});

export default UserBox;
