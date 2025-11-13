import React, { useEffect } from 'react'
import { createFragmentContainer, graphql } from 'react-relay'

import styled from 'styled-components'
import { connect } from 'react-redux'
import { useDisclosure } from '@liinkiing/react-hooks' // reviens

import { openDeleteProposalModal } from '~/redux/modules/proposal'
import type { ProposalPageHeaderButtons_proposal$data } from '~relay/ProposalPageHeaderButtons_proposal.graphql'
import type { ProposalPageHeaderButtons_step$data } from '~relay/ProposalPageHeaderButtons_step.graphql'
import type { ProposalPageHeaderButtons_viewer$data } from '~relay/ProposalPageHeaderButtons_viewer.graphql'
import ProposalVoteButtonWrapperFragment from '~/components/Proposal/Vote/ProposalVoteButtonWrapperFragment'
import ProposalFollowButton from '~/components/Proposal/Follow/ProposalFollowButton'
import ProposalVoteModal from '~/components/Proposal/Vote/ProposalVoteModal'
import ShareButtonDropdown from '~/components/Utils/ShareButtonDropdown'
import ProposalReportButton from '~/components/Proposal/Report/ProposalReportButton'
import EditButton from '~/components/Form/EditButton'
import DeleteButton from '~/components/Form/DeleteButton'
import { mediaQueryMobile, bootstrapGrid } from '~/utils/sizes'
import colors from '~/utils/colors'
import type { Dispatch } from '~/types'
import ProposalEditModal from '../../Edit/ProposalEditModal'
import ProposalDeleteModal from '../../Delete/ProposalDeleteModal'
import { ProposalContactButton } from '~/components/Proposal/Contact/ProposalContactButton'
import { EDIT_MODAL_ANCHOR } from '~/components/Proposal/Form/ProposalForm'
type ReduxProps = {
  readonly dispatch: Dispatch
}
type Props = ReduxProps & {
  readonly proposal: ProposalPageHeaderButtons_proposal$data
  readonly step: ProposalPageHeaderButtons_step$data | null | undefined
  readonly viewer: ProposalPageHeaderButtons_viewer$data | null | undefined
  readonly triggerRequirementsModal: (voteId: string) => void
}
const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  button:not(#login-button) {
    margin-right: 10px;
    margin-bottom: 10px;
  }

  ul.dropdown-menu {
    z-index: 1001;
  }

  margin: 15px;

  @media (min-width: ${bootstrapGrid.mdMin}px) {
    max-width: 587px;
    margin: 0;
    margin-top: 15px;
  }
`
const FixedButtons = styled.div`
  display: flex;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    text-align: center;
    z-index: 1001;
    background: ${colors.white};
    height: 63px;
    padding: 15px;
    border-top: 1px solid ${colors.lightGray};
    align-items: center;
    justify-content: center;
  }

  /** Boostrap for now until "Epurer" ticket */
  #proposal-vote-btn.active:hover {
    background-color: #dc3545;
    border-color: #dc3545;
  }
`
export const ProposalPageHeaderButtons = ({ proposal, viewer, step, dispatch, triggerRequirementsModal }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const isAuthor = viewer && viewer.id === proposal?.author?.id
  const editable = proposal?.form?.contribuable || proposal?.contribuable
  const hasExpiredRevisions = proposal?.expiredRevisions ? proposal.expiredRevisions.totalCount > 0 : false

  const canDelete = proposal?.access?.canDelete
  const canEdit = proposal?.access?.canEdit
  const canEditProposal = editable && canEdit

  useEffect(() => {
    if ((canEditProposal || (hasExpiredRevisions && isAuthor)) && window.location.href.includes(EDIT_MODAL_ANCHOR)) {
      onOpen()
    }
  }, [hasExpiredRevisions, canEditProposal, onOpen, isAuthor])
  const hasPendingRevisions = proposal?.pendingRevisions ? proposal.pendingRevisions.totalCount > 0 : false
  const opinionCanBeFollowed = proposal?.form?.step?.project?.opinionCanBeFollowed
  const hasVotableStep = !!proposal?.currentVotableStep

  return (
    <Buttons>
      {isOpen && <ProposalEditModal proposal={proposal} show={isOpen} onClose={onClose} />}
      <ProposalDeleteModal proposal={proposal} />
      <>
        {((hasVotableStep && step?.open && !proposal.isArchived) ||
          (opinionCanBeFollowed && !isAuthor && !proposal.isArchived)) && (
          <FixedButtons>
            {hasVotableStep && proposal?.publicationStatus !== 'DRAFT' && (
              <ProposalVoteButtonWrapperFragment
                proposal={proposal}
                step={step}
                viewer={viewer}
                disabled={!proposal}
                id="proposal-vote-btn"
                triggerRequirementsModal={triggerRequirementsModal}
              />
            )}
            {opinionCanBeFollowed && !isAuthor && proposal?.publicationStatus !== 'DRAFT' && (
              <ProposalFollowButton proposal={proposal} isAuthenticated={!!viewer} />
            )}
          </FixedButtons>
        )}
        {proposal?.publicationStatus !== 'DRAFT' && (
          <>
            <ShareButtonDropdown
              id="proposal-share-button"
              url={proposal?.url}
              title={proposal?.title}
              disabled={!proposal}
            />
            <ProposalReportButton proposal={proposal} disabled={!proposal} />
          </>
        )}
        {(canEdit || canDelete) && (
          <>
            {
              canEdit ? (
                <EditButton
                  id="proposal-edit-button"
                  label={hasPendingRevisions || hasExpiredRevisions ? 'review-proposal' : 'global.edit'}
                  author={{
                    uniqueId: proposal?.author?.slug,
                  }}
                  onClick={onOpen}
                  editable={editable}
                />
              ) : null
            }
            {
              canDelete ? (
                <DeleteButton
                  id="proposal-delete-button"
                  author={{
                    uniqueId: proposal?.author?.slug,
                  }}
                  onClick={() => {
                    dispatch(openDeleteProposalModal())
                  }}
                  deletable={proposal?.form?.contribuable}
                />
              ) : null
            }
          </>
        )}
        {proposal?.form?.canContact && !proposal.isArchived && (
          <ProposalContactButton proposalId={proposal.id} authorName={proposal.author.displayName} />
        )}
      </>
      {proposal?.publicationStatus !== 'DRAFT' && step && (
        <ProposalVoteModal proposal={proposal} step={step} triggerRequirementsModal={triggerRequirementsModal} />
      )}
    </Buttons>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    dispatch,
  }
}


const connector = connect(null, mapDispatchToProps)
export default createFragmentContainer(connector(ProposalPageHeaderButtons), {
  viewer: graphql`
    fragment ProposalPageHeaderButtons_viewer on User
    @argumentDefinitions(stepId: { type: "ID!" }, hasVotableStep: { type: "Boolean", defaultValue: true }) {
      id
      ...ProposalVoteButtonWrapperFragment_viewer
        @arguments(isAuthenticated: $isAuthenticated, stepId: $stepId)
        @include(if: $hasVotableStep)
    }
  `,
  step: graphql`
    fragment ProposalPageHeaderButtons_step on ProposalStep
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, token: { type: "String" }) {
      open
      ...ProposalVoteButtonWrapperFragment_step @arguments(token: $token, isAuthenticated: $isAuthenticated)
      ...ProposalVoteModal_step @arguments(token: $token)
    }
  `,
  proposal: graphql`
    fragment ProposalPageHeaderButtons_proposal on Proposal
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, proposalRevisionsEnabled: { type: "Boolean!" }, token: {type: "String"}) {
      id
      url
      title
      currentVotableStep {
        id
      }
      pendingRevisions: revisions(state: PENDING, first: 0) @include(if: $proposalRevisionsEnabled) {
        totalCount
      }
      expiredRevisions: revisions(state: EXPIRED, first: 0) @include(if: $proposalRevisionsEnabled) {
        totalCount
      }
      author {
        id
        slug
        displayName
      }
      contribuable
      form {
        step {
          project {
            opinionCanBeFollowed
          }
        }
        canContact
        contribuable
      }
      isArchived
      publicationStatus
      access {
          canEdit
          canDelete
      }
      ...ProposalVoteButtonWrapperFragment_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated, token: $token)
      ...ProposalVoteModal_proposal
      ...ProposalFollowButton_proposal @arguments(isAuthenticated: $isAuthenticated)
      ...ProposalReportButton_proposal @arguments(isAuthenticated: $isAuthenticated)
      ...ProposalEditModal_proposal @arguments(proposalRevisionsEnabled: $proposalRevisionsEnabled)
      ...ProposalDeleteModal_proposal
    }
  `,
})
