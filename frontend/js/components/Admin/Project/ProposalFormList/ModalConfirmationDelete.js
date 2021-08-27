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
import type { ModalConfirmationDelete_proposalForm$key } from '~relay/ModalConfirmationDelete_proposalForm.graphql';
import DeleteProposalFormMutation from '~/mutations/DeleteProposalFormMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { toast } from '~ds/Toast';

type Props = {|
  +proposalForm: ModalConfirmationDelete_proposalForm$key,
  +connectionName: string,
  +isAdmin: boolean,
|};

const FRAGMENT = graphql`
  fragment ModalConfirmationDelete_proposalForm on ProposalForm {
    id
    title
  }
`;

const deleteProposalForm = (
  proposalFormId: string,
  hide: () => void,
  intl: IntlShape,
  connectionName: string,
  isAdmin: boolean,
) => {
  const input = {
    id: proposalFormId,
  };
  hide();

  return DeleteProposalFormMutation.commit({ input, connections: [connectionName] }, isAdmin)
    .then(() => {
      toast({
        variant: 'success',
        content: intl.formatMessage({ id: 'proposal-form-successfully-deleted' }),
      });
    })
    .catch(() => {
      return mutationErrorToast(intl);
    });
};

const ModalConfirmationDelete = ({
  proposalForm: proposalFormFragment,
  connectionName,
  isAdmin,
}: Props): React.Node => {
  const proposalForm = useFragment(FRAGMENT, proposalFormFragment);
  const intl = useIntl();

  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        <ButtonQuickAction
          icon="TRASH"
          label={intl.formatMessage({ id: 'global.delete' })}
          variantColor="danger"
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
                { element: proposalForm.title },
              )}
            </Text>
          </Modal.Body>
          <Modal.Footer spacing={2}>
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
                onClick={() =>
                  deleteProposalForm(proposalForm.id, hide, intl, connectionName, isAdmin)
                }>
                {intl.formatMessage({ id: 'global.delete' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default ModalConfirmationDelete;
