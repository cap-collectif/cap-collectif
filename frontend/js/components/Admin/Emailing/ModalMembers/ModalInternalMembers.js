// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { MembersContainer } from './ModalMembers.style';
import type { Parameter_UsersQueryResponse } from '~relay/Parameter_UsersQuery.graphql';
import { ModalContainer } from '~/components/Admin/Emailing/MailParameter/common.style';

export type InternalMembers = $PropertyType<Parameter_UsersQueryResponse, 'users'>;

export type InternalMembersFormatted = $PropertyType<
  $PropertyType<Parameter_UsersQueryResponse, 'users'>,
  'edges',
>;

type Props = {|
  onClose: () => void,
  show: boolean,
  mailingListName: string,
  members: ?InternalMembersFormatted,
|};

export const ModalInternalMembers = ({ show, onClose, mailingListName, members }: Props) => (
  <ModalContainer
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
        {members
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(member => (
            <li key={member.id}>{member.email}</li>
          ))}
      </MembersContainer>
    </Modal.Body>
  </ModalContainer>
);

export default ModalInternalMembers;
