import * as React from 'react'
import { IntlShape, useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import {
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapUIIcon,
  CapUIModalSize,
  Heading,
  Modal,
  Text,
  toast,
  InfoMessage,
  CapUIFontSize,
} from '@cap-collectif/ui'
import type { ModalConfirmationDelete_questionnaire$key } from '@relay/ModalConfirmationDelete_questionnaire.graphql'
import DeleteQuestionnaireMutation from 'mutations/DeleteQuestionnaireMutation'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { useAppContext } from '../AppProvider/App.context'
import { QuestionnaireType } from '@relay/QuestionnaireListQuery.graphql'

type Props = {
  questionnaire: ModalConfirmationDelete_questionnaire$key
  connectionName: string
  types?: Array<QuestionnaireType>
}

const FRAGMENT = graphql`
  fragment ModalConfirmationDelete_questionnaire on Questionnaire {
    id
    title
    step {
      id
      title
      project {
        title
        adminAlphaUrl
      }
    }
  }
`

const deleteQuestionnaire = (
  questionnaireId: string,
  hide: () => void,
  intl: IntlShape,
  connectionName: string,
  isAdmin: boolean,
  types?: Array<QuestionnaireType>,
) => {
  const input = {
    id: questionnaireId,
  }
  hide()

  return DeleteQuestionnaireMutation.commit({ input, connections: [connectionName] }, isAdmin, types)
    .then(() => {
      toast({
        variant: 'success',
        content: intl.formatMessage({ id: 'questionnaire-successfully-deleted' }),
      })
    })
    .catch(() => {
      return mutationErrorToast(intl)
    })
}

const ModalConfirmationDelete: React.FC<Props> = ({ questionnaire: questionnaireFragment, connectionName, types }) => {
  const questionnaire = useFragment(FRAGMENT, questionnaireFragment)
  const { step } = questionnaire
  const { viewerSession } = useAppContext()
  const intl = useIntl()

  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Trash}
          label={intl.formatMessage({ id: 'global.delete' })}
          variantColor="danger"
        />
      }
      size={CapUIModalSize.Md}
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'delete-confirmation' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            {step && (
              <InfoMessage variant="warning" mb={4}>
                <InfoMessage.Content>
                  <Text fontSize={CapUIFontSize.BodySmall}>
                    {intl.formatMessage(
                      {
                        id: 'delete-questionnaire-linked-to-project-message',
                      },
                      {
                        step: <strong>{step.title}</strong>,
                        project: (
                          <a href={step?.project?.adminAlphaUrl} target="_blank" rel="noreferrer">
                            <strong>{step?.project?.title}</strong>
                          </a>
                        ),
                      },
                    )}
                  </Text>
                </InfoMessage.Content>
              </InfoMessage>
            )}
            <Text>
              {intl.formatMessage({ id: 'are-you-sure-to-delete-something' }, { element: questionnaire.title })}
            </Text>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                onClick={() =>
                  deleteQuestionnaire(questionnaire.id, hide, intl, connectionName, viewerSession.isAdmin, types)
                }
              >
                {intl.formatMessage({ id: 'global.delete' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default ModalConfirmationDelete
