// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button, Row, Col, ListGroupItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import DeleteModal from '../../Modal/DeleteModal';
import DefaultAvatar from '../../User/DefaultAvatar';
import DeleteUserInGroupMutation from '../../../mutations/DeleteUserInGroupMutation';
import {
  groupAdminUsersUserDeletionSuccessful,
  groupAdminUsersUserDeletionFailed,
  groupAdminUsersUserDeletionReset,
} from '../../../redux/modules/user';
import type { GroupAdminUsersListGroupItem_user } from '~relay/GroupAdminUsersListGroupItem_user.graphql';
import type { Uuid, Dispatch } from '../../../types';

type Props = {
  groupId: string,
  user: GroupAdminUsersListGroupItem_user,
  dispatch: Dispatch,
};

type State = {
  showRemoveUserModal: boolean,
};

const onDelete = (userId: Uuid, groupId: Uuid, dispatch) => {
  dispatch(groupAdminUsersUserDeletionReset());

  return DeleteUserInGroupMutation.commit({
    input: {
      userId,
      groupId,
    },
  })
    .then(() => {
      dispatch(groupAdminUsersUserDeletionSuccessful());
    })
    .catch(() => {
      dispatch(groupAdminUsersUserDeletionFailed());
    });
};

export class GroupAdminUsersListGroupItem extends React.Component<Props, State> {
  state = {
    showRemoveUserModal: false,
  };

  cancelCloseRemoveUserModal = () => {
    this.setState({ showRemoveUserModal: false });
  };

  render() {
    const { user, groupId, dispatch } = this.props;

    const { showRemoveUserModal } = this.state;

    return (
      <ListGroupItem>
        <DeleteModal
          closeDeleteModal={this.cancelCloseRemoveUserModal}
          showDeleteModal={showRemoveUserModal}
          deleteElement={() => {
            onDelete(user.id, groupId, dispatch);
          }}
          deleteModalTitle="group.admin.user.modal.delete.title"
          deleteModalContent="group.admin.user.modal.delete.content"
        />
        <Row>
          <Col xs={3}>
            {user.media ? (
              <img className="img-circle mr-15" src={user.media.url} alt={user.displayName} />
            ) : (
              <DefaultAvatar className="img-circle avatar mr-15" />
            )}
            {user.displayName}
          </Col>
          <Col xs={4} className="pull-right">
            <Button
              className="pull-right mt-5"
              bsStyle="danger"
              href="#"
              onClick={() => {
                this.setState({ showRemoveUserModal: !showRemoveUserModal });
              }}>
              <i className="fa fa-trash" /> <FormattedMessage id="global.delete" />
            </Button>
          </Col>
          <Col xs={12}>
            <p className="mt-10">
              {user.email}
              {user.phone && (
                <span>
                  {' | '}
                  {user.phone}
                </span>
              )}
            </p>
            <p>{user.biography}</p>
          </Col>
        </Row>
      </ListGroupItem>
    );
  }
}

const container = connect()(GroupAdminUsersListGroupItem);

export default createFragmentContainer(
  container,
  graphql`
    fragment GroupAdminUsersListGroupItem_user on User {
      id
      displayName
      biography
      email
      phone
      media {
        url(format: "default_avatar")
      }
    }
  `,
);
