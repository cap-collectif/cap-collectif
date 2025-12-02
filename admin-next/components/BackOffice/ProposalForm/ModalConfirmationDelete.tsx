import {
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapUIIcon,
  CapUIModalSize,
  Heading,
  Modal,
  Text,
} from '@cap-collectif/ui'
import type { ModalConfirmationDelete_proposalForm$key } from '@relay/ModalConfirmationDelete_proposalForm.graphql'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import DeleteProposalFormMutation from 'mutations/DeleteProposalFormMutation'
import * as React from 'react'
import { IntlShape, useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { useAppContext } from '../AppProvider/App.context'

type ModalConfirmationDeleteProps = {
  proposalForm: ModalConfirmationDelete_proposalForm$key
  connectionName: string
}

const FRAGMENT = graphql`
  fragment ModalConfirmationDelete_proposalForm on ProposalForm {
    id
    title
  }
`

const deleteProposalForm = (
  proposalFormId: string,
  hide: () => void,
  intl: IntlShape,
  connectionName: string,
  isAdmin: boolean,
) => {
  const input = {
    id: proposalFormId,
  }
  hide()

  return DeleteProposalFormMutation.commit({ input, connections: [connectionName] }, isAdmin)
    .then(() => {
      successToast(intl.formatMessage({ id: 'proposal-form-successfully-deleted' }))
    })
    .catch(() => {
      return mutationErrorToast(intl)
    })
}

const ModalConfirmationDelete: React.FC<ModalConfirmationDeleteProps> = ({
  proposalForm: proposalFormFragment,
  connectionName,
}) => {
  const proposalForm = useFragment(FRAGMENT, proposalFormFragment)
  const { viewerSession } = useAppContext()
  const intl = useIntl()

  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      size={CapUIModalSize.Md}
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Trash}
          label={intl.formatMessage({ id: 'global.delete' })}
          variantColor="danger"
        />
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'delete-confirmation' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>
              {intl.formatMessage({ id: 'are-you-sure-to-delete-something' }, { element: proposalForm.title })}
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
                onClick={() => deleteProposalForm(proposalForm.id, hide, intl, connectionName, viewerSession.isAdmin)}
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
