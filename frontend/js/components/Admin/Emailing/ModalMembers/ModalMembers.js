// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Modal } from 'react-bootstrap';
import { MembersContainer } from './ModalMembers.style';
import { type ModalMembers_mailingList } from '~relay/ModalMembers_mailingList.graphql';
import { ModalContainer } from '~/components/Admin/Emailing/MailParameter/common.style';

type Props = {|
  onClose: () => void,
  show: boolean,
  mailingList: ?ModalMembers_mailingList, // Not optional but flow doesn't understand
|};

export const ModalMembers = ({ show, onClose, mailingList }: Props) => {
  if (!mailingList) return null;

  const { name, users } = mailingList;

  return (
    <ModalContainer
      animation={false}
      show={show}
      onHide={onClose}
      bsSize="small"
      aria-labelledby="modal-title">
      <Modal.Header closeButton>
        <Modal.Title id="modal-title">{name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <MembersContainer>
          {users.edges
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
};

export default createFragmentContainer(ModalMembers, {
  mailingList: graphql`
    fragment ModalMembers_mailingList on MailingList {
      name
      users {
        totalCount
        edges {
          node {
            id
            email
          }
        }
      }
    }
  `,
});
