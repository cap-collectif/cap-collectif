import * as React from 'react'
import { useIntl } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import { Button, Modal, CapUIModalSize, Heading, Text, toast } from '@cap-collectif/ui'
import type { DeleteReplyModal_reply } from '~relay/DeleteReplyModal_reply.graphql'
import DeleteAnonymousReplyMutation from '~/mutations/DeleteAnonymousReplyMutation'
import DeleteUserReplyMutation from '~/mutations/DeleteUserReplyMutation'
import CookieMonster from '~/CookieMonster'
import Icon from '~ui/Icons/Icon'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { QuestionnaireStepPageContext } from '~/components/Page/QuestionnaireStepPage.context'
import type { DeleteReplyModal_questionnaire } from '~relay/DeleteReplyModal_questionnaire.graphql'
import ResetCss from '~/utils/ResetCss'
type Props = {
  readonly reply: DeleteReplyModal_reply
  readonly questionnaire: DeleteReplyModal_questionnaire
}
export const DeleteReplyModal = ({ reply, questionnaire }: Props) => {
  const intl = useIntl()
  const { anonymousRepliesIds } = React.useContext(QuestionnaireStepPageContext)
  const isAnonymousReply = reply.__typename === 'AnonymousReply'

  const handleSubmit = onClose => {
    const hashedToken = CookieMonster.getHashedAnonymousReplyCookie(questionnaire.id, reply.id)
    onClose()

    if (isAnonymousReply && hashedToken) {
      return DeleteAnonymousReplyMutation.commit({
        input: {
          hashedToken,
        },
        anonymousRepliesIds,
      }).then(response => {
        if (response?.deleteAnonymousReply?.replyId) {
          CookieMonster.removeAnonymousReplyCookie(questionnaire.id, reply.id)
          toast({
            variant: 'success',
            content: intl.formatHTMLMessage({
              id: 'reply.request.delete.success',
            }),
          })
        }
      })
    }

    DeleteUserReplyMutation.commit({
      input: {
        id: reply.id,
      },
    })
      .then(() => {
        onClose()
        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({
            id: 'reply.request.delete.success',
          }),
        })
      })
      .catch(() => {
        mutationErrorToast(intl)
      })
  }

  return (
    <Modal
      scrollBehavior="inside"
      ariaLabel={intl.formatMessage({
        id: 'delete-reply-modal',
      })}
      disclosure={
        <button type="button" className="btn-delete">
          <Icon name="trash" size={16} viewBox="0 0 16 16" />
        </button>
      }
      size={CapUIModalSize.Lg}
    >
      {({ hide }) => (
        <>
          <ResetCss>
            <Modal.Header>
              <Heading>
                {intl.formatMessage({
                  id: 'delete-confirmation',
                })}
              </Heading>
            </Modal.Header>
          </ResetCss>
          <Modal.Body>
            <Text>
              {intl.formatMessage({
                id: 'reply.delete.confirm',
              })}
            </Text>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <Button onClick={hide} variantSize="small" variant="secondary" variantColor="hierarchy" color="gray.400">
              {intl.formatMessage({
                id: 'global.cancel',
              })}
            </Button>
            <Button variantSize="small" variant="primary" variantColor="danger" onClick={() => handleSubmit(hide)}>
              {intl.formatMessage({
                id: 'global.delete',
              })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}
export default createFragmentContainer(DeleteReplyModal, {
  questionnaire: graphql`
    fragment DeleteReplyModal_questionnaire on Questionnaire {
      id
    }
  `,
  reply: graphql`
    fragment DeleteReplyModal_reply on Reply {
      __typename
      id
    }
  `,
})
