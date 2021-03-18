// @flow
import * as React from 'react';
import { FormattedMessage, type IntlShape, useIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Container, ButtonUnsubscribe } from './UserRegister.style';
import UserAvatar from '~/components/User/UserAvatar';
import type { UserRegister_user } from '~relay/UserRegister_user.graphql';
import type { UserRegister_event } from '~relay/UserRegister_event.graphql';
import UnsubscribeToEventAsRegisteredMutation from '~/mutations/UnsubscribeToEventAsRegisteredMutation';
import { toast } from '~ds/Toast';

type Props = {
  user?: UserRegister_user,
  event: UserRegister_event,
};

export const unsubscribe = (eventId: string, intl: IntlShape) => {
  const input = {
    eventId,
  };

  UnsubscribeToEventAsRegisteredMutation.commit({
    input,
    isAuthenticated: true,
  })
    .then(() => {
      toast({
        variant: 'success',
        content: intl.formatHTMLMessage({ id: 'event_registration.create.unregister_success' }),
      });
    })
    .catch(() => {
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({ id: 'global.error.server.form' }),
      });
    });
};

export const UserRegister = ({ user, event }: Props) => {
  const intl = useIntl();
  return (
    <Container>
      {user && (
        <div>
          <UserAvatar user={user} /> {user.username}
        </div>
      )}

      <ButtonUnsubscribe type="button" onClick={() => unsubscribe(event.id, intl)}>
        <FormattedMessage id="event_registration.unsubscribe" />
      </ButtonUnsubscribe>
    </Container>
  );
};

export default createFragmentContainer(UserRegister, {
  user: graphql`
    fragment UserRegister_user on User {
      username
      ...UserAvatar_user
    }
  `,
  event: graphql`
    fragment UserRegister_event on Event {
      id
    }
  `,
});
