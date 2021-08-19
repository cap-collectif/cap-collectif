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
import type { ModalConfirmationDelete_questionnaire$key } from '~relay/ModalConfirmationDelete_questionnaire.graphql';
import DeleteQuestionnaireMutation from '~/mutations/DeleteQuestionnaireMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { toast } from '~ds/Toast';

type Props = {|
  +questionnaire: ModalConfirmationDelete_questionnaire$key,
  +connectionName: string,
|};

const FRAGMENT = graphql`
  fragment ModalConfirmationDelete_questionnaire on Questionnaire {
    id
    title
  }
`;

const deleteQuestionnaire = (
  questionnaireId: string,
  hide: () => void,
  intl: IntlShape,
  connectionName: string,
) => {
  const input = {
    id: questionnaireId,
  };
  hide();

  return DeleteQuestionnaireMutation.commit({ input, connections: [connectionName] })
    .then(() => {
      toast({
        variant: 'success',
        content: intl.formatMessage({ id: 'questionnaire-successfully-deleted' }),
      });
    })
    .catch(() => {
      return mutationErrorToast(intl);
    });
};

const ModalConfirmationDelete = ({
  questionnaire: questionnaireFragment,
  connectionName,
}: Props): React.Node => {
  const questionnaire = useFragment(FRAGMENT, questionnaireFragment);
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
                { element: questionnaire.title },
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
                onClick={() => deleteQuestionnaire(questionnaire.id, hide, intl, connectionName)}>
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
