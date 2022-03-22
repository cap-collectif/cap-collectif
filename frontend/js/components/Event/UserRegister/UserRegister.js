// @flow
import * as React from 'react';
import { type IntlShape, useIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { toast, Button } from '@cap-collectif/ui';
import type { UserRegister_event } from '~relay/UserRegister_event.graphql';
import UnsubscribeToEventAsRegisteredMutation from '~/mutations/UnsubscribeToEventAsRegisteredMutation';

type Props = {
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

export const UserRegister = ({ event }: Props) => {
  const intl = useIntl();
  return (
    <Button
      variantColor="danger"
      variant="secondary"
      variantSize="big"
      type="button"
      width={['100%', 'auto']}
      onClick={() => unsubscribe(event.id, intl)}
      justifyContent="center">
      {intl.formatMessage({ id: 'event_registration.unsubscribe' })}
    </Button>
  );
};

export default createFragmentContainer(UserRegister, {
  event: graphql`
    fragment UserRegister_event on Event {
      id
    }
  `,
});
