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
import type { ModalConfirmationDelete_consultation$key } from '@relay/ModalConfirmationDelete_consultation.graphql'
import DeleteConsultationMutation from 'mutations/DeleteConsultationMutation'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'

type Props = {
  consultation: ModalConfirmationDelete_consultation$key
  connectionName: string
}

const FRAGMENT = graphql`
  fragment ModalConfirmationDelete_consultation on Consultation {
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

const deleteConsultation = async (
  consultationId: string,
  hide: () => void,
  intl: IntlShape,
  connectionName: string,
) => {
  const input = {
    id: consultationId,
  }
  hide()

  try {
    await DeleteConsultationMutation.commit({ input, connections: [connectionName] })
    toast({
      variant: 'success',
      content: intl.formatMessage({ id: 'consultation-successfully-deleted' }),
    })
  } catch (error) {
    mutationErrorToast(intl)
  }
}

const ModalConfirmationDelete: React.FC<Props> = ({ consultation: consultationFragment, connectionName }) => {
  const consultation = useFragment(FRAGMENT, consultationFragment)
  const { step } = consultation
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
                        id: 'delete-consultation-linked-to-project-message',
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
              {intl.formatMessage({ id: 'are-you-sure-to-delete-something' }, { element: consultation.title })}
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
                onClick={() => deleteConsultation(consultation.id, hide, intl, connectionName)}
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
