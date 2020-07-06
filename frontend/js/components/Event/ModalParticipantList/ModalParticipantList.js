// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { List } from './ModalParticipantList.style';
import type { ModalParticipantList_event } from '~relay/ModalParticipantList_event.graphql';
import Participant from '~/components/Event/ParticipantList/Participant/Participant';
import CloseButton from '~/components/Form/CloseButton';

type Props = {|
  event: ModalParticipantList_event,
  show: boolean,
  onClose: () => void,
|};

export const ModalParticipantList = ({ event, show, onClose }: Props) => (
  <Modal
    animation={false}
    show={show}
    onHide={onClose}
    bsSize="large"
    aria-labelledby="contained-modal-title-lg">
    <Modal.Header closeButton>
      <Modal.Title id="contained-modal-title-lg">
        <FormattedMessage id="members" />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <List>
        {event?.participants?.edges
          ?.filter(Boolean)
          .map(edge => edge?.node)
          .filter(Boolean)
          .map((participant, idx) => (
            <Participant participant={participant} key={idx} />
          ))}
      </List>
    </Modal.Body>
    <Modal.Footer>
      <CloseButton onClose={onClose} label="global.close" />
    </Modal.Footer>
  </Modal>
);

export default createFragmentContainer(ModalParticipantList, {
  event: graphql`
    fragment ModalParticipantList_event on Event {
      participants {
        edges {
          node {
            ...Participant_participant
          }
        }
      }
    }
  `,
});
