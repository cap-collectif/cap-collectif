// @flow
import React from 'react';
import { useIntl, type IntlShape } from 'react-intl';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import Button from '~ds/Button/Button';
import DeleteRepliesMutation from '~/mutations/DeleteRepliesMutation';
import { toast } from '~ds/Toast';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';

type Props = {|
  +replyIds: string[],
  +connectionName: string,
  +disclosure: React$Element<any>,
|};

const deleteReply = async (
  replyIds: string[],
  hide: () => void,
  intl: IntlShape,
  connectionName: string,
) => {
  hide();
  try {
    await DeleteRepliesMutation.commit({
      input: {
        replyIds,
      },
      connectionName,
    });
    toast({
      variant: 'success',
      content: intl.formatHTMLMessage({ id: 'reply.request.delete.success' }),
    });
  } catch (e) {
    mutationErrorToast(intl);
  }
};

const ReplyModalConfirmationDelete = ({ replyIds, connectionName, disclosure }: Props) => {
  const intl = useIntl();

  const singleReplyTranslation = intl.formatHTMLMessage({ id: 'responses.alert.delete' });
  const multipleRepliesTranslation = intl.formatHTMLMessage(
    { id: 'responses.multiple.alert.delete' },
    { n: <strong>{replyIds.length}</strong> },
  );
  const bodyTranslation = replyIds.length > 1 ? multipleRepliesTranslation : singleReplyTranslation;

  return (
    <Modal ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })} disclosure={disclosure}>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'delete-confirmation' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>{bodyTranslation}</Text>
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
                onClick={() => deleteReply(replyIds, hide, intl, connectionName)}>
                {intl.formatMessage({ id: 'global.delete' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default ReplyModalConfirmationDelete;
