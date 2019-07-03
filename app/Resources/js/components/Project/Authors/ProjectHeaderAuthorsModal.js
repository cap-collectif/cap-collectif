// @flow
import * as React from 'react';
import { Modal, ListGroupItem } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import CloseButton from '../../Form/CloseButton';
import type { ProjectHeaderAuthorsModal_users } from '~relay/ProjectHeaderAuthorsModal_users.graphql';
import UserAvatar from '../../User/UserAvatar';

type Props = {|
  show: boolean,
  onClose: Function,
  users: ProjectHeaderAuthorsModal_users,
|};

const renderAuthorsList = (users: ProjectHeaderAuthorsModal_users) =>
  users.map(user => (
    <ListGroupItem>
      <UserAvatar user={user} />
      <a className="ml-15" href={user.url}>
        {user.username}{' '}
      </a>
    </ListGroupItem>
  ));

const ProjectHeaderAuthorsModal = ({ show, onClose, users }: Props) => (
  <Modal
    id="show-authors-modal"
    className="reply__modal--show"
    animation={false}
    onHide={onClose}
    show={show}
    bsSize="large"
    aria-labelledby="contained-modal-title-lg">
    <Modal.Header closeButton>
      <Modal.Title id="contained-modal-title-lg" className="font-weight-bold">
        <FormattedMessage
          id="number-of-authors"
          values={{
            num: users ? users.length : 0,
          }}
        />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>{renderAuthorsList(users)}</Modal.Body>
    <Modal.Footer>
      <CloseButton onClose={onClose} />
    </Modal.Footer>
  </Modal>
);

export default createFragmentContainer(ProjectHeaderAuthorsModal, {
  users: graphql`
    fragment ProjectHeaderAuthorsModal_users on User @relay(plural: true) {
      id
      url
      username
      ...UserAvatar_user
    }
  `,
});
