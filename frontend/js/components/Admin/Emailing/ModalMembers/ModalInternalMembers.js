// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { MembersContainer } from './ModalMembers.style';
import type { Parameter_UsersQueryResponse } from '~relay/Parameter_UsersQuery.graphql';

export type InternalMembers = $PropertyType<Parameter_UsersQueryResponse, 'users'>;

type Props = {|
  onClose: () => void,
  show: boolean,
  mailingListName: string,
  members: ?InternalMembers,
|};

export const ModalInternalMembers = ({ show, onClose, mailingListName, members }: Props) => (
  <Modal
    animation={false}
    show={show}
    onHide={onClose}
    bsSize="small"
    aria-labelledby="modal-title">
    <Modal.Header closeButton>
      <Modal.Title id="modal-title">{mailingListName}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <MembersContainer>
        {members?.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(member => (
            <li key={member.id}>{member.email}</li>
          ))}
      </MembersContainer>
    </Modal.Body>
  </Modal>
);

export default ModalInternalMembers;
