// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Container, ButtonUnsubscribe } from './UserRegister.style';
import UserAvatar from '~/components/User/UserAvatar';
import type { UserRegister_user } from '~relay/UserRegister_user.graphql';
import type { UserRegister_event } from '~relay/UserRegister_event.graphql';
import UnsubscribeToEventAsRegisteredMutation from '~/mutations/UnsubscribeToEventAsRegisteredMutation';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';

type Props = {
  user?: UserRegister_user,
  event: UserRegister_event,
};

export const unsubscribe = (eventId: string) => {
  const input = {
    eventId,
  };

  UnsubscribeToEventAsRegisteredMutation.commit({
    input,
    isAuthenticated: true,
  })
    .then(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.SUCCESS,
          content: 'event_registration.create.unregister_success',
        },
      });
    })
    .catch(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.ERROR,
          content: 'global.error.server.form',
        },
      });
    });
};

export const UserRegister = ({ user, event }: Props) => (
  <Container>
    {user && (
      <div>
        <UserAvatar user={user} /> {user.username}
      </div>
    )}

    <ButtonUnsubscribe type="button" onClick={() => unsubscribe(event.id)}>
      <FormattedMessage id="event_registration.unsubscribe" />
    </ButtonUnsubscribe>
  </Container>
);

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
