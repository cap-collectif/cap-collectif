// @flow
import React from 'react';
import { Col } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import UserPreview from './UserPreview';
import type { UserBox_user } from './__generated__/UserBox_user.graphql';

type Props = {
  user: ?UserBox_user,
  className: string,
};

class UserBox extends React.Component<Props> {
  static defaultProps = {
    className: '',
  };

  render() {
    const { user, className } = this.props;
    return (
      <Col xs={12} sm={6} md={4} lg={3} className={className}>
        {/* $FlowFixMe */}
        <UserPreview user={user} />
      </Col>
    );
  }
}

export default createFragmentContainer(UserBox, {
  user: graphql`
    fragment UserBox_user on User {
      ...UserPreview_user
    }
  `,
});
