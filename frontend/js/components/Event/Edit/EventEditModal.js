// @flow
import * as React from 'react';
import { Modal, CapUIModalSize, Heading, Button, Flex } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import { isInvalid, submit, isSubmitting } from 'redux-form';
import styled, { type StyledComponent } from 'styled-components';
import { formName } from '../Form/EventForm';
import type { State, Dispatch } from '../../../types';
import type { EventEditModal_query } from '~relay/EventEditModal_query.graphql';
import type { EventEditModal_event } from '~relay/EventEditModal_event.graphql';
import { EventFormInModal } from '../Create/EventCreateModal';
import ResetCss from '~/utils/ResetCss';

type RelayProps = {|
  query: EventEditModal_query,
  event: EventEditModal_event,
|};

type Props = {|
  ...RelayProps,
  show: boolean,
  submitting: boolean,
  dispatch: Dispatch,
  pristine: boolean,
  handleClose: () => void,
|};

const NotifyInfoMessage: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  font-size: 14px;
  font-style: italic;
  opacity: 0.8;
`;

export const EventEditModal = ({
  submitting,
  dispatch,
  show,
  pristine,
  query,
  event,
  handleClose,
}: Props) => {
  const intl = useIntl();

  return (
    <Modal
      show={show}
      onClose={handleClose}
      size={CapUIModalSize.Xl}
      aria-labelledby="contained-modal-title-lg">
      <ResetCss>
        <Modal.Header>
          <Heading as="h4">{intl.formatMessage({ id: 'edit-event' })}</Heading>
        </Modal.Header>
      </ResetCss>
      <Modal.Body>
        <EventFormInModal query={query} event={event} isFrontendView />
      </Modal.Body>
      <Modal.Footer>
        {event && event.participants.totalCount > 0 && (
          <NotifyInfoMessage>
            {intl.formatMessage({ id: 'event-modification-notification-to-members' })}
          </NotifyInfoMessage>
        )}
        <Flex>
          <Button
            variant="secondary"
            variantSize="big"
            variantColor="primary"
            mr={2}
            onClick={handleClose}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button
            variant="primary"
            variantSize="big"
            variantColor="primary"
            label={intl.formatMessage({ id: 'global.submit' })}
            id="confirm-event-submit"
            disabled={pristine}
            isLoading={submitting}
            onClick={() => {
              dispatch(submit(formName));
            }}>
            {intl.formatMessage({ id: 'global.submit' })}
          </Button>
        </Flex>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state: State) => ({
  invalid: isInvalid(formName)(state),
  submitting: isSubmitting(formName)(state),
});

export const container = connect<any, any, _, _, _, _>(mapStateToProps)(EventEditModal);

export default createFragmentContainer(container, {
  query: graphql`
    fragment EventEditModal_query on Query
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...EventForm_query @include(if: $isAuthenticated)
    }
  `,
  event: graphql`
    fragment EventEditModal_event on Event {
      ...EventForm_event
      participants {
        totalCount
      }
    }
  `,
});
