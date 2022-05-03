// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { ButtonGroup, Button, Text } from '@cap-collectif/ui';
import { getTranslation } from '~/services/Translation';
import type { EventActions_query$key } from '~relay/EventActions_query.graphql';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import EventEditButton from '~/components/Event/Edit/EventEditButton';
import EventDeleteModal from './EventDeleteModal';
import RegisterForm from '~/components/Event/RegisterForm/RegisterForm';
import UserRegister from '~/components/Event/UserRegister/UserRegister';
import type { GlobalState } from '~/types';

type Props = {|
  +queryRef: ?EventActions_query$key,
|};

const FRAGMENT = graphql`
  fragment EventActions_query on Query
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, eventId: { type: "ID!" }) {
    ...EventEditButton_query @arguments(isAuthenticated: $isAuthenticated)
    ...RegisterForm_query @arguments(isAuthenticated: $isAuthenticated, eventId: $eventId)
    event: node(id: $eventId) {
      ... on Event {
        ...EventEditButton_event
        ...UserRegister_event
        id
        isViewerParticipatingAtEvent @include(if: $isAuthenticated)
        viewerDidAuthor @include(if: $isAuthenticated)
        isRegistrationPossible
        translations {
          locale
          link
        }
        link
        review {
          id
          status
        }
        adminUrl
        isEventRegistrationComplete
        availableRegistration
      }
    }
    viewer @include(if: $isAuthenticated) {
      id
      isAdmin
    }
  }
`;

export const EventActions = ({ queryRef }: Props) => {
  const query = useFragment(FRAGMENT, queryRef);
  const { currentLanguage } = useSelector((state: GlobalState) => state.language);

  const hasProposeEvent = useFeatureFlag('allow_users_to_propose_events');
  const intl = useIntl();

  if (!query) return null;
  const { event, viewer } = query;
  if (!event || !event.id) return null;

  const {
    isViewerParticipatingAtEvent,
    viewerDidAuthor,
    review,
    isRegistrationPossible,
    translations,
    isEventRegistrationComplete,
    availableRegistration,
  } = event;

  const translation = translations ? getTranslation(translations, currentLanguage) : undefined;
  const link = translation?.link || undefined;
  const displayLeftEventPlacesTag =
    !isEventRegistrationComplete &&
    availableRegistration &&
    availableRegistration > 0 &&
    availableRegistration < 4;

  let registerButton = <UserRegister user={viewer} event={event} />;
  if ((!isViewerParticipatingAtEvent || !viewer) && !isEventRegistrationComplete) {
    registerButton = (
      <>
        <RegisterForm queryRef={query} />{' '}
        {displayLeftEventPlacesTag ? (
          <Text as="span" mt="12px">
            {intl.formatMessage({ id: 'left-event-places' }, { num: availableRegistration })}
          </Text>
        ) : null}
      </>
    );
  } else if (isEventRegistrationComplete && !isViewerParticipatingAtEvent) {
    registerButton = (
      <Button variantSize="big" variantColor="danger" variant="primary" disabled>
        {intl.formatMessage({ id: 'complete' })}
      </Button>
    );
  }

  const eventIsNotApproved =
    viewerDidAuthor && hasProposeEvent && review && review?.status !== 'APPROVED';

  return (
    <ButtonGroup mt={7} width="100%">
      {eventIsNotApproved && (
        <>
          <EventEditButton event={event} query={query} />
          <EventDeleteModal eventId={event.id} />
        </>
      )}
      {!eventIsNotApproved && (isRegistrationPossible || link) && <>{registerButton}</>}
      {viewer?.isAdmin ? (
        <Button
          href={event.adminUrl}
          variantSize="big"
          variantColor="primary"
          variant="secondary"
          as="a"
          width={['100%', 'auto']}
          justifyContent="center">
          {intl.formatMessage({ id: 'global.edit' })}
        </Button>
      ) : null}
    </ButtonGroup>
  );
};

export default EventActions;
