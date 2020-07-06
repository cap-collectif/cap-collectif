// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Container, UserInfo } from './Participant.style';
import UserAvatar from '~/components/User/UserAvatar';
import type { Participant_participant } from '~relay/Participant_participant.graphql';

type Props = {|
  participant: Participant_participant,
  isAnonymous?: boolean,
|};

export const Participant = ({ participant, isAnonymous }: Props) => (
  <Container>
    <UserAvatar user={participant} needDefaultAvatar={isAnonymous} />

    <UserInfo>
      {participant.username && !isAnonymous ? (
        <span>{participant.username}</span>
      ) : (
        <FormattedMessage id="global.anonymous" />
      )}

      {participant.contributions && !isAnonymous && (
        <FormattedMessage
          id="global.counters.contributions"
          values={{ num: participant.contributions?.totalCount }}
        />
      )}

      {participant.votes && !isAnonymous && (
        <FormattedMessage id="global.votes" values={{ num: participant.votes?.totalCount }} />
      )}
    </UserInfo>
  </Container>
);

export default createFragmentContainer(Participant, {
  participant: graphql`
    fragment Participant_participant on Participant {
      ... on User {
        username
        votes {
          totalCount
        }
        contributions {
          totalCount
        }
        ...UserAvatar_user
      }
      ... on NotRegistered {
        username
      }
    }
  `,
});
