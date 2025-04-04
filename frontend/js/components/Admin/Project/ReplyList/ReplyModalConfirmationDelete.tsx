import React from 'react'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import DeleteRepliesMutation from '~/mutations/DeleteRepliesMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { Button, ButtonGroup, CapUIModalSize, Heading, Modal, Text, toast } from '@cap-collectif/ui'
type Props = {
  readonly replyIds: string[]
  readonly connectionName: string
  readonly disclosure: React.ReactElement<React.ComponentProps<any>, any>
}

const deleteReply = async (replyIds: string[], hide: () => void, intl: IntlShape, connectionName: string) => {
  hide()

  try {
    await DeleteRepliesMutation.commit({
      input: {
        replyIds,
      },
      connectionName,
    })
    toast({
      variant: 'success',
      content: intl.formatHTMLMessage({
        id: 'reply.request.delete.success',
      }),
    })
  } catch (e) {
    mutationErrorToast(intl)
  }
}

const ReplyModalConfirmationDelete = ({ replyIds, connectionName, disclosure }: Props) => {
  const intl = useIntl()
  const singleReplyTranslation = intl.formatHTMLMessage({
    id: 'responses.alert.delete',
  })
  const multipleRepliesTranslation = intl.formatHTMLMessage(
    {
      id: 'responses.multiple.alert.delete',
    },
    {
      n: <strong>{replyIds.length}</strong>,
    },
  )
  const bodyTranslation = replyIds.length > 1 ? multipleRepliesTranslation : singleReplyTranslation
  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({
        id: 'delete-confirmation',
      })}
      disclosure={disclosure}
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>
              {intl.formatMessage({
                id: 'delete-confirmation',
              })}
            </Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>{bodyTranslation}</Text>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({
                  id: 'cancel',
                })}
              </Button>
              <Button
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                onClick={() => deleteReply(replyIds, hide, intl, connectionName)}
              >
                {intl.formatMessage({
                  id: 'global.delete',
                })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default ReplyModalConfirmationDelete
