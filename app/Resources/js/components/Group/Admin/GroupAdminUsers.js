// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button, Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import type { GroupAdminUsers_group } from './__generated__/GroupAdminUsers_group.graphql';
import DeleteUserInGroupMutation from '../../../mutations/DeleteUserInGroupMutation';
import GroupAdminModalAddUsers from './GroupAdminModalAddUsers';
import DeleteModal from '../../Modal/DeleteModal';
import type { Uuid } from '../../../types';

type Props = { group: GroupAdminUsers_group };
type State = { showAddUsersModal: boolean, showRemoveUserModal: ?number };

const onDelete = (userId: Uuid, groupId: Uuid) => {
  return DeleteUserInGroupMutation.commit({
    input: {
      userId,
      groupId,
    },
  }).then(location.reload());
};

export class GroupAdminUsers extends React.Component<Props, State> {
  state = {
    showAddUsersModal: false,
    showRemoveUserModal: null,
  };

  openCreateModal = () => {
    this.setState({ showAddUsersModal: true });
  };

  handleClose = () => {
    this.setState({ showAddUsersModal: false });
  };

  cancelCloseRemoveUserModal = () => {
    this.setState({ showRemoveUserModal: null });
  };

  render() {
    const { group } = this.props;
    const { showAddUsersModal, showRemoveUserModal } = this.state;

    return (
      <div className="box box-primary container">
        <div className="box-header  pl-0">
          <h4 className="box-title">
            <FormattedMessage id="group.admin.users" />
          </h4>
        </div>
        <Button
          className="mt-5 mb-15"
          bsStyle="success"
          href="#"
          onClick={() => this.openCreateModal()}>
          <i className="fa fa-plus-circle" /> <FormattedMessage id="group.admin.add_users" />
        </Button>
        <GroupAdminModalAddUsers
          show={showAddUsersModal}
          onClose={this.handleClose}
          group={group}
        />
        {group.usersConnection.edges ? (
          <ListGroup>
            {group.usersConnection.edges
              .map(edge => edge && edge.node)
              // https://stackoverflow.com/questions/44131502/filtering-an-array-of-maybe-nullable-types-in-flow-to-remove-null-values
              .filter(Boolean)
              .map((node, index) => (
                <ListGroupItem key={index}>
                  <DeleteModal
                    closeDeleteModal={this.cancelCloseRemoveUserModal}
                    showDeleteModal={index === showRemoveUserModal}
                    deleteElement={() => {
                      onDelete(node.id, group.id);
                    }}
                    deleteModalTitle={'group.admin.user.modal.delete.title'}
                    deleteModalContent={'group.admin.user.modal.delete.content'}
                  />
                  <Row>
                    <Col xs={3}>
                      {node.media ? (
                        <img
                          className="img-circle mr-15"
                          src={node.media.url}
                          alt={node.displayName}
                        />
                      ) : (
                        <img
                          className="img-circle mr-15"
                          src="/bundles/sonatauser/default_avatar.png"
                          alt={node.displayName}
                        />
                      )}
                      {node.displayName}
                    </Col>
                    <Col xs={4} className="pull-right">
                      <Button
                        className="pull-right mt-5"
                        bsStyle="danger"
                        href="#"
                        onClick={() => {
                          this.setState({ showRemoveUserModal: index });
                        }}>
                        <i className="fa fa-trash" /> <FormattedMessage id="global.delete" />
                      </Button>
                    </Col>
                    <Col xs={12}>
                      <p className="mt-10">
                        {node.email}
                        {node.phone && (
                          <span>
                            {' | '}
                            {node.phone}
                          </span>
                        )}
                      </p>
                      <p>{node.biography}</p>
                    </Col>
                  </Row>
                </ListGroupItem>
              ))}
          </ListGroup>
        ) : (
          <div className="mb-15">
            <FormattedMessage id="group.admin.no_users" />
          </div>
        )}
      </div>
    );
  }
}

export default createFragmentContainer(
  GroupAdminUsers,
  graphql`
    fragment GroupAdminUsers_group on Group {
      id
      title
      usersConnection {
        edges {
          node {
            id
            displayName
            biography
            email
            phone
            media {
              url
            }
          }
        }
      }
    }
  `,
);
