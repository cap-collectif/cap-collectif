// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button, Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import type { GroupAdminUsers_group } from './__generated__/GroupAdminUsers_group.graphql';
import DeleteUserInGroupMutation from '../../../mutations/DeleteUserInGroupMutation';

type Props = { group: GroupAdminUsers_group };

const onDelete = (userId: string, groupId: string) => {
  return DeleteUserInGroupMutation.commit({
    input: {
      userId,
      groupId,
    },
  }).then(location.reload());
};

export class GroupAdminUsers extends Component<Props> {
  render() {
    const { group } = this.props;

    return (
      <div className="box box-primary container">
        <div className="box-header">
          <h4 className="box-title">
            <FormattedMessage id="group.admin.users" />
          </h4>
        </div>
        {group.userGroups.length ? (
          <ListGroup style={{ margin: 10, paddingBottom: 10 }}>
            {group.userGroups.map((userGroup, index) => (
              <ListGroupItem key={index}>
                <Row>
                  <Col xs={3}>
                    {userGroup.user.media ? (
                      <img
                        className="img-circle mr-15"
                        src={userGroup.user.media.url}
                        alt={userGroup.user.displayName}
                      />
                    ) : (
                      <img
                        className="img-circle mr-15"
                        src="/bundles/sonatauser/default_avatar.png"
                        alt={userGroup.user.displayName}
                      />
                    )}
                    {userGroup.user.displayName}
                  </Col>
                  <Col xs={4}>
                    <p className="mt-10">{userGroup.user.email}</p>
                  </Col>
                  <Col xs={4} className="pull-right">
                    <Button
                      className="pull-right mt-5"
                      bsStyle="danger"
                      href="#"
                      onClick={() => onDelete(userGroup.user.id, group.id)}>
                      <FormattedMessage id="global.delete" />
                    </Button>
                  </Col>
                </Row>
              </ListGroupItem>
            ))}
          </ListGroup>
        ) : (
          <div style={{ padding: '10px' }}>
            <FormattedMessage id="group.admin.no_users" />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = () => {
  return {};
};

const container = connect(mapStateToProps);

export default createFragmentContainer(
  container,
  graphql`
    fragment GroupAdminUsers_group on Group {
      id
      title
      userGroups {
        id
        user {
          id
          displayName
          email
          media {
            url
          }
        }
      }
    }
  `,
);
