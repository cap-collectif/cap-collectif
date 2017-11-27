// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button, Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import {
  isValid,
  isInvalid,
  isSubmitting,
  hasSubmitSucceeded,
  hasSubmitFailed
} from 'redux-form'
import type { GroupAdminUsers_group } from './__generated__/GroupAdminUsers_group.graphql';
import AlertAdminForm from '../../Alert/AlertAdminForm';
import DeleteUserInGroupMutation from '../../../mutations/DeleteUserInGroupMutation';
import GroupAdminModalAddUsers from './GroupAdminModalAddUsers';
import DeleteModal from '../../Modal/DeleteModal';
import type { Uuid } from '../../../types';

type Props = {
  group: GroupAdminUsers_group,
  hasSubmitSucceeded: boolean,
  hasSubmitFailed: boolean,
  isValid: boolean,
  isInvalid: boolean,
  isSubmitting: boolean,
};

type State = {
  showAddUsersModal: boolean,
  showRemoveUserModal: ?number
};

const onDelete = (userId: Uuid, groupId: Uuid) => {
  return DeleteUserInGroupMutation.commit({
    input: {
      userId,
      groupId,
    },
  }).then(location.reload());
};

export const formName = 'group-admin-users';

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
    const {
      group,
      // hasSubmitSucceeded,
      // hasSubmitFailed,
      // isValid,
      // isInvalid,
      // isSubmitting,
    } = this.props;

    const { showAddUsersModal, showRemoveUserModal } = this.state;

    return (
      <div className="box box-primary container">
        <div className="box-header  pl-0">
          <h3 className="box-title">
            <FormattedMessage id="group.admin.users" />
          </h3>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/137-ajouter-des-groupes">
            <i className="fa fa-info-circle" /> Aide
          </a>
        </div>
        <div className="box-content">
          <Button
            className="mt-5 mb-15"
            bsStyle="success"
            href="#"
            onClick={() => this.openCreateModal()}>
            <i className="fa fa-plus-circle" /> <FormattedMessage id="group.admin.add_users" />
          </Button>
          <AlertAdminForm
          valid={isValid}
          invalid={isInvalid}
          submitSucceeded={hasSubmitSucceeded}
          submitFailed={hasSubmitFailed}
          submitting={isSubmitting}
          />
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
      </div>
    );
  }
}

const container = connect(
  state => ({
    valid: isValid('group-users-add')(state),
    invalid: isInvalid('group-users-add')(state),
    submitting: isSubmitting('group-users-add')(state),
    submitSucceeded: hasSubmitSucceeded('group-users-add')(state),
    submitFailed: hasSubmitFailed('group-users-add')(state)
  })
)(GroupAdminUsers);

export default createFragmentContainer(
  container,
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
