// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import RegisterForm from '~/components/Event/RegisterForm/RegisterForm';
import type { ModalEventRegister_user } from '~relay/ModalEventRegister_user.graphql';
import type { ModalEventRegister_event } from '~relay/ModalEventRegister_event.graphql';
import UserRegister from '~/components/Event/UserRegister/UserRegister';

type Props = {|
  show: boolean,
  onClose: () => void,
  user?: ?ModalEventRegister_user,
  event: ModalEventRegister_event,
|};

const ModalEventRegister = ({ show, onClose, user, event }: Props) => (
  <Modal
    animation={false}
    show={show}
    onHide={onClose}
    bsSize="large"
    aria-labelledby="contained-modal-title-lg">
    <Modal.Header closeButton />
    <Modal.Body>
      {!event.isViewerParticipatingAtEvent || !user ? (
        <RegisterForm user={user} event={event} />
      ) : (
        <UserRegister user={user} event={event} />
      )}
    </Modal.Body>
  </Modal>
);

export default createFragmentContainer(ModalEventRegister, {
  event: graphql`
    fragment ModalEventRegister_event on Event
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      isViewerParticipatingAtEvent @include(if: $isAuthenticated)
      ...RegisterForm_event
      ...UserRegister_event
    }
  `,
  user: graphql`
    fragment ModalEventRegister_user on User {
      ...RegisterForm_user
      ...UserRegister_user
    }
  `,
});
