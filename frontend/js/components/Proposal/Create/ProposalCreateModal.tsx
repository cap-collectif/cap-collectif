import { $Values } from 'utility-types'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { useAnalytics } from 'use-analytics'
import { connect } from 'react-redux'
import { isSubmitting, change, submit, isPristine, isInvalid } from 'redux-form'
import { Modal, Button, Heading, ButtonGroup, CapUIModalSize } from '@cap-collectif/ui'
import ProposalForm, { formName } from '../Form/ProposalForm'
import type { ProposalCreateModal_proposalForm$key } from '~relay/ProposalCreateModal_proposalForm.graphql'
import type { Dispatch, GlobalState } from '~/types'
import ProposalOtherPanelsModal from './ProposalOtherPanelsModal'
import ResetCss from '~/utils/ResetCss'
import ProposalErrorModal from '~/components/Proposal/Create/ProposalErrorModal'
import type { CreateProposalInput } from '~relay/CreateProposalMutation.graphql'
import isIos from '~/utils/isIos'
type Props = {
  readonly proposalForm: ProposalCreateModal_proposalForm$key
  readonly submitting: boolean
  readonly pristine: boolean
  readonly invalid: boolean
  readonly dispatch: Dispatch
  readonly onOpen: () => void
  readonly onClose: () => void
  readonly title: string
  readonly show: boolean
  readonly fullSizeOnMobile?: boolean
}
const FRAGMENT = graphql`
  fragment ProposalCreateModal_proposalForm on ProposalForm {
    id
    contribuable
    step {
      title
      url
      project {
        title
      }
    }
    ...ProposalForm_proposalForm
    ...ProposalOtherPanelsModal_proposalForm
    ...ProposalErrorModal_proposalForm
  }
`
const STATE = {
  NORMAL: 'NORMAL',
  LEAVE: 'LEAVE',
  MAP: 'MAP',
  ERROR: 'ERROR',
}

const ProposalCreateModal = ({
  proposalForm: proposalFormFragment,
  submitting,
  pristine,
  dispatch,
  invalid,
  onOpen,
  onClose,
  title,
  show,
  fullSizeOnMobile = false,
}: Props): JSX.Element => {
  const [modalState, setModalState] = React.useState<$Values<typeof STATE>>('NORMAL')
  const [errorCount, setErrorCount] = React.useState<number>(0)
  const [isDraft, setIsDraft] = React.useState<boolean>(false)
  const [valuesSaved, setValuesSaved] = React.useState<CreateProposalInput | null | undefined>(null)
  const intl = useIntl()
  const { track } = useAnalytics()
  const proposalForm = useFragment(FRAGMENT, proposalFormFragment)

  const resetModalState = () => {
    setModalState('NORMAL')
    setErrorCount(0)
  }

  const onSubmitFailed = () => {
    setErrorCount(errorCount + 1)
    setModalState('ERROR')
  }

  if (!show) return null
  return (
    <Modal
      baseId="proposal-create-modal"
      show={show}
      hideCloseButton={modalState === 'LEAVE'}
      hideOnEsc={modalState !== 'LEAVE'}
      hideOnClickOutside={false}
      onOpen={onOpen}
      onClose={onClose}
      // @ts-ignore MAJ DS types
      fullPageScrollable
      fullSizeOnMobile={fullSizeOnMobile}
      forceModalDialogToFalse={isIos()}
      ariaLabel={intl.formatMessage({
        id: title,
      })}
      size={CapUIModalSize.Xl}
    >
      {() => (
        <>
          <ResetCss>
            <Modal.Header
              closeIconLabel={intl.formatMessage({
                id: 'close.modal',
              })}
            >
              <Heading>
                {intl.formatMessage({
                  id: title,
                })}
              </Heading>
            </Modal.Header>
          </ResetCss>
          <>
            <ProposalOtherPanelsModal
              proposalForm={proposalForm}
              onClose={onClose}
              modalState={modalState as 'NORMAL' | 'LEAVE' | 'MAP' | 'ERROR'}
              resetModalState={resetModalState}
            />
            <>
              <Modal.Body display={modalState === 'NORMAL' ? 'flex' : 'none'}>
                <ProposalForm
                  onAddressEdit={() => setModalState('MAP')}
                  proposalForm={proposalForm}
                  proposal={null}
                  onSubmitSuccess={onClose}
                  onSubmitFailed={onSubmitFailed}
                  setValuesSaved={setValuesSaved}
                />
              </Modal.Body>
              <Modal.Footer display={modalState === 'NORMAL' ? 'flex' : 'none'}>
                <ButtonGroup>
                  <Button
                    id="confirm-proposal-create-as-draft"
                    variantSize="big"
                    variant="tertiary"
                    variantColor="primary"
                    isLoading={submitting && isDraft}
                    disabled={pristine || (!isDraft && submitting)}
                    onClick={() => {
                      track('submit_draft_proposal_click', {
                        step_title: proposalForm.step?.title || '',
                        step_url: proposalForm.step?.url || '',
                        project_title: proposalForm.step?.project?.title || '',
                      })
                      dispatch(change(formName, 'draft', true))
                      setIsDraft(true)
                      setTimeout(() => {
                        // TODO find a better way
                        // We need to wait validation values to be updated with 'draft'
                        dispatch(submit(formName))
                      }, 200)
                    }}
                  >
                    {intl.formatMessage({
                      id: 'global.save',
                    })}
                  </Button>
                  <Button
                    variantSize="big"
                    variant="primary"
                    variantColor="primary"
                    id="confirm-proposal-create"
                    isLoading={submitting && !isDraft}
                    disabled={pristine || invalid || (isDraft && submitting)}
                    onClick={() => {
                      track('submit_proposal_click', {
                        step_title: proposalForm.step?.title || '',
                        step_url: proposalForm.step?.url || '',
                        project_title: proposalForm.step?.project?.title || '',
                      })
                      dispatch(change(formName, 'draft', false))
                      setIsDraft(false)
                      setTimeout(() => {
                        // TODO find a better way
                        // We need to wait validation values to be updated with 'draft'
                        dispatch(submit(formName))
                      }, 200)
                    }}
                  >
                    {intl.formatMessage({
                      id: 'global.publish',
                    })}
                  </Button>
                </ButtonGroup>
              </Modal.Footer>
            </>
            {modalState === 'ERROR' && (
              <ProposalErrorModal
                allowRetry={errorCount < 2}
                resetModalState={resetModalState}
                onClose={onClose}
                valuesSaved={valuesSaved}
                proposalForm={proposalForm}
                onSubmitFailed={onSubmitFailed}
              />
            )}
          </>
        </>
      )}
    </Modal>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
})

export default connect(mapStateToProps)(ProposalCreateModal)
