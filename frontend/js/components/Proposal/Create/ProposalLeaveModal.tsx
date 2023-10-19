import * as React from 'react'
import { useIntl } from 'react-intl'
import { reset } from 'redux-form'
import { useDispatch } from 'react-redux'
import { Text, Button, ButtonGroup, Modal, Flex } from '@cap-collectif/ui'
import { formName } from '../Form/ProposalForm'
import type { Dispatch } from '~/types'
type Props = {
  readonly onClose: () => void
  readonly resetModalState: () => void
}

const ProposalLeaveModal = ({ onClose, resetModalState }: Props): JSX.Element => {
  const intl = useIntl()
  const dispatch: Dispatch = useDispatch()
  return (
    <>
      <Modal.Body height="unset" align="center">
        <Flex direction="column" alignItems="center" my={[0, '20%']}>
          <Text textAlign="center" fontSize={33} mb={8}>
            <span className="d-b emoji-container" role="img" aria-label="Door">
              🚪
            </span>
          </Text>
          <Text textAlign="center" fontSize={[20, 33]} fontWeight={600} mb={2}>
            {intl.formatMessage({
              id: 'leave-form',
            })}
          </Text>
          <Text maxWidth="300px" textAlign="center">
            {intl.formatMessage({
              id: 'changes-will-not-be-saved',
            })}
          </Text>
        </Flex>
      </Modal.Body>
      <Modal.Footer>
        <ButtonGroup>
          <Button variantSize="big" variant="secondary" variantColor="hierarchy" onClick={resetModalState}>
            {intl.formatMessage({
              id: 'global.cancel',
            })}
          </Button>
          <Button
            variantSize="big"
            variant="primary"
            variantColor="danger"
            onClick={() => {
              resetModalState()
              onClose()
              dispatch(reset(formName))
            }}
          >
            {intl.formatMessage({
              id: 'global-exit',
            })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </>
  )
}

export default ProposalLeaveModal
