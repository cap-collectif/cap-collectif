// @flow
import * as React from 'react';
import { useIntl, type IntlShape } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { toast } from '~ds/Toast';
import DeleteEventMutation from '~/mutations/DeleteEventMutation';
import type { AdminEventModalConfirmationDelete_event$key } from '~relay/AdminEventModalConfirmationDelete_event.graphql';

type Props = {|
  +event: AdminEventModalConfirmationDelete_event$key,
|};

const FRAGMENT = graphql`
  fragment AdminEventModalConfirmationDelete_event on Event {
    id
    title
  }
`;

const deleteEvent = (eventId: string, hide: () => void, intl: IntlShape) => {
  const input = {
    eventId,
  };
  hide();
  return DeleteEventMutation.commit({ input })
    .then(() =>
      toast({
        variant: 'success',
        content: intl.formatMessage({ id: 'event-successfully-deleted' }),
      }),
    )
    .catch(() => mutationErrorToast(intl));
};

const AdminEventModalConfirmationDelete = ({ event: eventFragment }: Props): React.Node => {
  const event = useFragment(FRAGMENT, eventFragment);
  const intl = useIntl();
  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        <ButtonQuickAction
          icon="TRASH"
          size="md"
          variantColor="danger"
          label={intl.formatMessage({ id: 'global.delete' })}
        />
      }>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'delete-confirmation' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>
              {intl.formatMessage(
                { id: 'are-you-sure-to-delete-something' },
                { element: event.title },
              )}
            </Text>
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button
                variantSize="medium"
                variant="secondary"
                variantColor="hierarchy"
                onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                onClick={() => deleteEvent(event.id, hide, intl)}>
                {intl.formatMessage({ id: 'global.delete' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default AdminEventModalConfirmationDelete;
