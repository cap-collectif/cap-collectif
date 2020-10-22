// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { MembersContainer } from './ModalMembers.style';

type Members = $ReadOnlyArray<?{|
  +node: {|
    +id: string,
    +email: ?string,
  |},
|}>;

export type ModalMembersData = {|
  mailingListName: string,
  mailingListMembers: {|
    +totalCount: number,
    +edges: ?Members,
  |},
|};

type Props = {|
  onClose: () => void,
  data: ModalMembersData,
|};

export const ModalMembers = ({ onClose, data }: Props) => (
  <Modal
    animation={false}
    show={!!data}
    onHide={onClose}
    bsSize="small"
    aria-labelledby="modal-title">
    <Modal.Header closeButton>
      <Modal.Title id="modal-title">{data.mailingListName}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <MembersContainer>
        {data.mailingListMembers?.edges
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

export default ModalMembers;
