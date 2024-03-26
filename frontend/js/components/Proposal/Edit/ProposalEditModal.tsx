import { $Values } from 'utility-types'
import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import styled from 'styled-components'
import { AnimatePresence, m as motion } from 'framer-motion'
import type { IntlShape } from 'react-intl'
import { injectIntl, FormattedMessage } from 'react-intl'
import { isSubmitting, submit, change, isInvalid, isPristine } from 'redux-form'
import { Button as BsButton } from 'react-bootstrap'
import { connect } from 'react-redux'
import cn from 'classnames'
import { Button, Heading, ButtonGroup, Modal, CapUIModalSize } from '@cap-collectif/ui'
import ProposalForm, { formName } from '../Form/ProposalForm'
import ProposalDraftAlert from '../Page/ProposalDraftAlert'
import type { Dispatch, GlobalState } from '~/types'
import type { ProposalEditModal_proposal$data, ProposalRevisionState } from '~relay/ProposalEditModal_proposal.graphql'
import { ProposalRevisionItem } from '~/shared/ProposalRevision/Modal/ProposalRevisionModalForm.style'
import { pxToRem } from '~/utils/styles/mixins'
import ResetCss from '~/utils/ResetCss'
import Collapsable from '~ui/Collapsable'
import { mediaQueryMobile } from '~/utils/sizes'
import colors from '~/styles/modules/colors'
import ProposalOtherPanelsModal from '../Create/ProposalOtherPanelsModal'
import ProposalErrorModal from '~/components/Proposal/Create/ProposalErrorModal'
import type { ChangeProposalContentInput } from '~relay/ChangeProposalContentMutation.graphql'
import isIos from '~/utils/isIos'
type Props = {
  readonly intl: IntlShape
  readonly proposal: ProposalEditModal_proposal$data
  readonly show: boolean
  readonly submitting: boolean
  readonly invalid: boolean
  readonly pristine: boolean
  readonly dispatch: Dispatch
  readonly onClose: () => void
}
const ModalProposalEditContainer = styled(Modal).attrs({
  className: 'proposalCreate__modal',
})`
  && .custom-modal-dialog {
    transform: none;
  }

  & > .expired-revision .modal-body {
    height: 60vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    & h2 {
      font-weight: 600;
      color: #232b31;
      font-size: ${pxToRem(18)};
    }

    & p {
      color: #545e68;
    }

    & .emoji-container {
      font-size: 5rem;
      margin-bottom: 10px;
    }
  }
`
const ProposalRevisionsList = styled.ul`
  list-style: '- ';
  padding-left: 10px;
  margin-top: 10px;
  margin-bottom: 0;
  li {
    button {
      padding: 0;
    }
    .body-collapse {
      width: 840px;
      margin-top: 10px;
      @media (max-width: ${mediaQueryMobile.maxWidth}) {
        width: auto;
      }
    }
  }
  & > li + li {
    margin-top: 10px;
  }
`

const isProposalRevisionsExpired = (proposal: ProposalEditModal_proposal$data): boolean => {
  if (!proposal.allRevisions) return false
  const unrevisedRevisions =
    proposal.allRevisions.totalCount > 0
      ? proposal.allRevisions?.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(revision => revision.state !== 'REVISED')
      : []
  return unrevisedRevisions
    ? unrevisedRevisions.length > 0 && unrevisedRevisions.every(revision => revision.isExpired)
    : false
}

// cp of edge node type, but if we had TypeScript, we could have done
// : readonly Array<ProposalEditModal_proposal['allRevisions']['edges'][0]['node']>
// to pick the type of a sample of an element in an array, but Flow ¯\_(ツ)_/¯
const getProposalPendingRevisions = (
  proposal: ProposalEditModal_proposal$data,
): ReadonlyArray<{
  readonly id: string
  readonly state: ProposalRevisionState
  readonly isExpired: boolean
  readonly reason: string | null | undefined
  readonly body: string | null | undefined
}> => {
  if (!proposal.allRevisions) return []
  return (
    proposal.allRevisions.edges
      ?.filter(Boolean)
      .map(edge => edge.node)
      .filter(revision => revision.state === 'PENDING')
      .filter(revision => !revision.isExpired) ?? []
  )
}

const STATE = {
  NORMAL: 'NORMAL',
  LEAVE: 'LEAVE',
  MAP: 'MAP',
  ERROR: 'ERROR',
}
export const ProposalEditModal = ({
  invalid,
  proposal,
  show,
  pristine,
  submitting,
  dispatch,
  intl,
  onClose,
}: Props) => {
  const [modalState, setModalState] = React.useState<$Values<typeof STATE>>('NORMAL')
  const [errorCount, setErrorCount] = React.useState<number>(0)
  const [isDraft, setIsDraft] = React.useState<boolean>(proposal.publicationStatus === 'DRAFT')
  const [valuesSaved, setValuesSaved] = React.useState<ChangeProposalContentInput | null | undefined>(null)
  if (!proposal || !show) return null
  const pendingRevisions = getProposalPendingRevisions(proposal)
  const isRevisionExpired = isProposalRevisionsExpired(proposal)
  const hasPendingRevisions = pendingRevisions.length > 0

  const onSubmitFailed = () => {
    setErrorCount(errorCount + 1)
    setModalState('ERROR')
  }

  const resetModalState = () => {
    setModalState('NORMAL')
    setErrorCount(0)
  }

  return (
    <ModalProposalEditContainer
      baseId="proposal-edit-modal"
      size={CapUIModalSize.Xl}
      fullSizeOnMobile
      show={show}
      // @ts-ignore Moda types to improve in DS
      dialogClassName={cn('custom-modal-dialog', {
        'expired-revision': isRevisionExpired,
      })}
      hideCloseButton={modalState === 'LEAVE'}
      hideOnEsc={modalState !== 'LEAVE'}
      hideOnClickOutside={false}
      forceModalDialogToFalse={isIos()}
      onClose={() => {
        if (modalState !== 'LEAVE') setModalState('LEAVE')
        onClose()
      }}
      ariaLabel={intl.formatMessage({
        id: 'contained-modal-title-lg',
      })}
    >
      {isRevisionExpired ? (
        <>
          <Modal.Header
            closeLabel={intl.formatMessage({
              id: 'close.modal',
            })}
            pb={8}
            borderBottom={`1px solid ${colors.gray[200]}`}
          />
          <Modal.Body>
            <span className="d-b emoji-container" role="img" aria-label="Crying Face">
              😓
            </span>
            <FormattedMessage tagName="h2" id="global.sorry" />
            <FormattedMessage tagName="p" id="expired.review.request" />
          </Modal.Body>
        </>
      ) : (
        <>
          <ResetCss>
            <Modal.Header
              closeLabel={intl.formatMessage({
                id: 'close.modal',
              })}
              borderBottom={['', `1px solid ${colors.gray[200]}`]}
            >
              <Heading>
                {intl.formatMessage({
                  id: hasPendingRevisions ? 'review-my-proposal' : 'global.edit',
                })}
              </Heading>
            </Modal.Header>
          </ResetCss>
          {/** @ts-ignore TODO Maj framer */}
          <AnimatePresence>
            <ProposalOtherPanelsModal
              proposalForm={proposal.form}
              onClose={onClose}
              modalState={modalState as 'NORMAL' | 'LEAVE' | 'MAP' | 'ERROR'}
              resetModalState={resetModalState}
            />
            <motion.div
              key="normal"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
                display: 'block',
              }}
              style={{
                overflow: 'scroll',
              }}
              exit={{
                opacity: 0,
                display: 'none',
              }}
            >
              <Modal.Body height="unset" display={modalState === 'NORMAL' ? 'flex' : 'none'}>
                <ProposalDraftAlert proposal={proposal} mb={6} />
                {hasPendingRevisions && (
                  <ProposalRevisionItem as="div" className="mb-10">
                    <p className="font-weight-bold m-0">
                      {intl.formatMessage({
                        id: 'reason.review.request',
                      })}
                    </p>
                    <ProposalRevisionsList>
                      {pendingRevisions.map(revision => (
                        <li key={revision.id}>
                          <span>{revision.reason}&nbsp;</span>
                          <Collapsable closeOnClickAway={false} className="clearfix">
                            {({ visible }) => (
                              <Collapsable.Button inline={false} showCaret={false}>
                                {!visible && (
                                  <BsButton variant="link" bsStyle="link">
                                    <FormattedMessage id="open-instructions" />
                                  </BsButton>
                                )}
                                <Collapsable.Element isAbsolute={false} ariaLabel="Contenu">
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: revision.body,
                                    }}
                                  />
                                  <BsButton variant="link" bsStyle="link">
                                    <FormattedMessage id="close-instructions" />
                                  </BsButton>
                                </Collapsable.Element>
                              </Collapsable.Button>
                            )}
                          </Collapsable>
                        </li>
                      ))}
                    </ProposalRevisionsList>
                    {!proposal.form.contribuable && (
                      <p className="mb-0 mt-20">
                        {intl.formatMessage({
                          id: 'warning.review.modification',
                        })}
                      </p>
                    )}
                  </ProposalRevisionItem>
                )}
                <ProposalForm
                  onAddressEdit={() => setModalState('MAP')}
                  proposalForm={proposal.form}
                  proposal={proposal}
                  isBackOfficeInput={false}
                  onSubmitSuccess={onClose}
                  onSubmitFailed={onSubmitFailed}
                  setValuesSaved={setValuesSaved}
                />
              </Modal.Body>
              <Modal.Footer
                borderTop={['', `1px solid ${colors.gray[200]}`]}
                display={modalState === 'NORMAL' ? 'flex' : 'none'}
              >
                <ButtonGroup>
                  {proposal.publicationStatus !== 'DRAFT' && (
                    <Button
                      onClick={onClose}
                      variantSize="big"
                      variant="secondary"
                      variantColor="hierarchy"
                      isLoading={submitting}
                    >
                      {intl.formatMessage({
                        id: 'global.cancel',
                      })}
                    </Button>
                  )}
                  {proposal.publicationStatus === 'DRAFT' && (
                    <Button
                      id="confirm-proposal-create-as-draft"
                      variantSize="big"
                      variant="tertiary"
                      variantColor="primary"
                      isLoading={submitting && isDraft}
                      disabled={(!isDraft && pristine) || (!isDraft && submitting)}
                      onClick={() => {
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
                  )}
                  <Button
                    id="confirm-proposal-edit"
                    variantSize="big"
                    variant="primary"
                    variantColor="primary"
                    isLoading={submitting && !isDraft}
                    disabled={(!isDraft && pristine) || invalid || (isDraft && submitting)}
                    onClick={() => {
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
            </motion.div>
            {modalState === 'ERROR' && (
              <ProposalErrorModal
                allowRetry={errorCount < 2}
                resetModalState={resetModalState}
                onClose={onClose}
                valuesSaved={valuesSaved}
                proposalForm={proposal.form}
                onSubmitFailed={onSubmitFailed}
                proposal={proposal}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </ModalProposalEditContainer>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
})

// @ts-ignore
const container = connect(mapStateToProps)(injectIntl(ProposalEditModal))
export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalEditModal_proposal on Proposal
    @argumentDefinitions(proposalRevisionsEnabled: { type: "Boolean!" }) {
      id
      allRevisions: revisions @include(if: $proposalRevisionsEnabled) {
        totalCount
        edges {
          node {
            id
            state
            isExpired
            reason
            body
          }
        }
      }

      form {
        contribuable
        ...ProposalForm_proposalForm
        ...ProposalOtherPanelsModal_proposalForm
        ...ProposalErrorModal_proposalForm
      }
      publicationStatus
      ...ProposalForm_proposal
      ...ProposalErrorModal_proposal
      ...ProposalDraftAlert_proposal
    }
  `,
})
