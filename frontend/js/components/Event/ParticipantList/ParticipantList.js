// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Container, TitleContainer, List, ButtonSeeAll } from './ParticipantList.style';
import Participant from '~/components/Event/ParticipantList/Participant/Participant';
import type { ParticipantList_event } from '~relay/ParticipantList_event.graphql';
import type { State } from '~/types';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

const LIMIT_PARTICIPANT_DISPLAY = 6;

type Props = {|
  event: ParticipantList_event,
  isSuperAdmin?: boolean,
  setShowModalParticipant: boolean => void,
|};

export const ParticipantList = ({ event, isSuperAdmin, setShowModalParticipant }: Props) => (
  <Container>
    <div>
      <TitleContainer>
        <FormattedMessage
          id="registered.dynamic"
          tagName="h2"
          values={{ num: event?.participants.totalCount }}
        />

        {(isSuperAdmin || event.viewerDidAuthor) && (
          <a
            className="btn btn-default"
            id="download-event-registration"
            href={`/export-my-event-participants/${event.id}`}>
            <Icon name={ICON_NAME.download} color="#000" size={14} className="mr-5" />
            <FormattedMessage id="global.export" />
          </a>
        )}
      </TitleContainer>

      <List>
        {event?.participants?.edges?.filter(Boolean).map((participant, idx) => (
          <Participant
            participant={participant.node}
            isAnonymous={participant.registeredAnonymously}
            key={idx}
          />
        ))}
      </List>

      {event?.participants.totalCount > LIMIT_PARTICIPANT_DISPLAY && (
        <ButtonSeeAll type="button" onClick={() => setShowModalParticipant(true)}>
          <FormattedMessage id="event_registration.listing.see_all" />
        </ButtonSeeAll>
      )}
    </div>
  </Container>
);

const mapStateToProps = (state: State) => ({
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
});

const ParticipantListConnected = connect<any, any, _, _, _, _>(mapStateToProps)(ParticipantList);

export default createFragmentContainer(ParticipantListConnected, {
  event: graphql`
    fragment ParticipantList_event on Event
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      viewerDidAuthor @include(if: $isAuthenticated)
      participants {
        totalCount
        edges {
          registeredAnonymously
          node {
            ...Participant_participant
          }
        }
      }
    }
  `,
});
