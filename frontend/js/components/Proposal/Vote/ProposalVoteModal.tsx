import * as React from 'react'
import { useIntl } from 'react-intl'
import moment from 'moment'
import { graphql, commitLocalUpdate, useFragment } from 'react-relay'
import { ConnectionHandler } from 'relay-runtime'
import { Modal, Button, Heading, CapUIModalSize, Flex, toast } from '@cap-collectif/ui'
import { useDispatch, useSelector } from 'react-redux'
import { isPristine, submit } from 'redux-form'
import { closeVoteModal, vote } from '~/redux/modules/proposal'
import ProposalsUserVotesTable, { getFormName } from '../../Project/Votes/ProposalsUserVotesTable'
import environment from '~/createRelayEnvironment'
import type { GlobalState } from '~/types'
import type { ProposalVoteModal_proposal$key } from '~relay/ProposalVoteModal_proposal.graphql'
import type { ProposalVoteModal_step$key } from '~relay/ProposalVoteModal_step.graphql'
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper'
import usePrevious from '~/utils/hooks/usePrevious'
import ResetCss from '~/utils/ResetCss'
import invariant from '~/utils/invariant'
import UpdateProposalVotesMutation from '~/mutations/UpdateProposalVotesMutation'
import UpdateAnonymousProposalVotesMutation from '~/mutations/UpdateAnonymousProposalVotesMutation'
import { ProposalVoteModalContainer } from './ProposalVoteModal.style'
import VoteMinAlert from '~/components/Project/Votes/VoteMinAlert'
import CookieMonster from '@shared/utils/CookieMonster'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import focusOnClose from './utils/focusOnClose'
import { ProposalModalVoteHelpText } from '~/components/Proposal/Vote/ProposalModalVoteHelpText'

type Props = {
  proposal: ProposalVoteModal_proposal$key
  step: ProposalVoteModal_step$key
  triggerRequirementsModal: (voteId: string) => void
}
const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalVoteModal_proposal on Proposal {
    id
  }
`
const STEP_FRAGMENT = graphql`
  fragment ProposalVoteModal_step on ProposalStep @argumentDefinitions(token: { type: "String" }) {
    id
    votesRanking
    votesHelpText
    votesMin
    project {
      slug
    }
    ...VoteMinAlert_step @arguments(token: $token)
    isSecretBallot
    canDisplayBallot
    publishedVoteDate
    ...interpellationLabelHelper_step @relay(mask: false)
    ...ProposalsUserVotesTable_step @arguments(token: $token)
    viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
      ...ProposalsUserVotesTable_votes
      totalCount
    }
  }
`

export const ProposalVoteModal = ({ proposal: proposalRef, step: stepRef, triggerRequirementsModal }: Props) => {
  const intl = useIntl()
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const localState = useSelector((state: GlobalState) => state)

  const { currentVoteModal } = useSelector((state: GlobalState) => state.proposal)
  const showModal = !!currentVoteModal && currentVoteModal === proposal.id
  const prevShowModal = usePrevious(showModal)
  const { user } = useSelector((state: GlobalState) => state.user)
  const viewerIsConfirmedByEmail = user && user.isEmailConfirmed
  const isAuthenticated = !!user
  const dispatch = useDispatch()
  const pristine = isPristine(getFormName(step))(localState)

  const token = CookieMonster.getParticipantCookie()
  const isVoteMin = useFeatureFlag('votes_min')
  // Create temp vote to display Proposal in ProposalsUserVotesTable
  const createTmpVote = React.useCallback(() => {
    commitLocalUpdate(environment as any, store => {
      const dataID = `client:newTmpVote:${proposal.id}`
      let newNode: any = store.get(dataID)

      if (!newNode) {
        newNode = store.create(dataID, 'ProposalVote')
      }

      newNode.setValue(viewerIsConfirmedByEmail, 'published')

      if (!viewerIsConfirmedByEmail) {
        newNode.setValue('WAITING_AUTHOR_CONFIRMATION', 'notPublishedReason')
      }

      newNode.setValue(true, 'anonymous')
      newNode.setValue(null, 'id') // This will be used to know that this is the tmp vote

      newNode.setLinkedRecord(store.get(proposal.id), 'proposal')
      // Create a new edge
      const edgeID = `client:newTmpEdge:${proposal.id}`
      let newEdge = store.get(edgeID)

      if (!newEdge) {
        newEdge = store.create(edgeID, 'ProposalVoteEdge')
      }

      newEdge.setLinkedRecord(newNode, 'node')
      const stepProxy = store.get(step.id)
      if (!stepProxy) return
      const args = token
        ? {
            orderBy: {
              field: 'POSITION',
              direction: 'ASC',
            },
            token,
          }
        : {
            orderBy: {
              field: 'POSITION',
              direction: 'ASC',
            },
          }
      const connection = stepProxy.getLinkedRecord('viewerVotes', args)

      if (!connection) {
        return
      }

      ConnectionHandler.insertEdgeAfter(connection, newEdge)
    })
  }, [proposal.id, step.id, viewerIsConfirmedByEmail, token])
  const deleteTmpVote = React.useCallback(() => {
    commitLocalUpdate(environment as any, store => {
      const dataID = `client:newTmpVote:${proposal.id}`
      const stepProxy = store.get(step.id)
      if (!stepProxy) return
      const args = token
        ? {
            orderBy: {
              field: 'POSITION',
              direction: 'ASC',
            },
            token,
          }
        : {
            orderBy: {
              field: 'POSITION',
              direction: 'ASC',
            },
          }
      const connection = stepProxy.getLinkedRecord('viewerVotes', args)

      if (connection) {
        ConnectionHandler.deleteNode(connection, dataID)
      }

      store.delete(dataID)
    })
  }, [proposal.id, step.id, token])
  React.useEffect(() => {
    if (!prevShowModal && showModal) {
      createTmpVote()
    } else if (!showModal && prevShowModal) {
      deleteTmpVote()
    }
  }, [prevShowModal, showModal, deleteTmpVote, createTmpVote])

  const votesMin: number = isVoteMin && step.votesMin ? step.votesMin : 1
  const viewerVotesBeforeValidation = step?.viewerVotes?.totalCount || 0
  const remainingVotesAfterValidation = votesMin - viewerVotesBeforeValidation - 1

  const onSubmit = (values: {
    votes: Array<{
      public: boolean
      id: string
    }>
  }) => {
    const tmpVote = values.votes?.filter(v => v.id === null)[0]
    if (!tmpVote) return
    // First we add the vote
    return vote(dispatch, step.id, proposal.id, !tmpVote.public, intl, isAuthenticated, token).then(data => {
      const vote = data?.addProposalVote?.voteEdge?.node ?? data?.addProposalSmsVote?.voteEdge?.node

      if (!vote) {
        invariant(false, 'The vote id is missing.')
      }

      if (!isAuthenticated) {
        CookieMonster.addParticipantCookie(data.addProposalSmsVote.participantToken)
      }

      tmpVote.id = vote.id

      if (step.votesRanking || !pristine) {
        if (isAuthenticated) {
          UpdateProposalVotesMutation.commit(
            {
              input: {
                step: step.id,
                votes: values.votes
                  .filter(voteFilter => voteFilter.id !== null)
                  .map(v => ({
                    id: v.id,
                    anonymous: !v.public,
                  })),
              },
              stepId: step.id,
              isAuthenticated,
              token: null,
            },
            {
              id: null,
              position: -1,
              isVoteRanking: step.votesRanking,
            },
          )
        } else {
          UpdateAnonymousProposalVotesMutation.commit(
            {
              input: {
                step: step.id,
                votes: values.votes
                  .filter(voteFilter => voteFilter.id !== null)
                  .map(v => ({
                    id: v.id,
                    anonymous: !v.public,
                  })),
                token: CookieMonster.getParticipantCookie(),
              },
              stepId: step.id,
              isAuthenticated,
              token: CookieMonster.getParticipantCookie(),
            },
            {
              id: null,
              position: -1,
              isVoteRanking: step.votesRanking,
            },
          )
        }
      }

      const shouldTriggerConsentInternalCommunication =
        data?.addProposalVote?.shouldTriggerConsentInternalCommunication ??
        data?.addProposalSmsVote?.shouldTriggerConsentInternalCommunication

      if (vote?.completionStatus === 'MISSING_REQUIREMENTS' || shouldTriggerConsentInternalCommunication) {
        triggerRequirementsModal(vote.id)
        return
      }

      tmpVote.id = vote.id
      const hasFinished = remainingVotesAfterValidation < 0
      const hasJustFinished = remainingVotesAfterValidation === 0
      const isInterpellation = isInterpellationContextFromStep(step)

      if (!isInterpellation && votesMin > 1 && (!hasFinished || hasJustFinished)) {
        toast({
          variant: hasJustFinished ? 'success' : 'warning',
          content: intl.formatMessage(
            {
              id: hasJustFinished
                ? isAuthenticated
                  ? 'participation-validated'
                  : 'participation-validated-anonymous'
                : 'vote-for-x-proposals',
            },
            {
              num: remainingVotesAfterValidation,
              div: (...chunks) => <div>{chunks}</div>,
              b: (...chunks) => <b>{chunks}</b>,
              a: (...chunks) => (
                <span
                  style={{
                    marginLeft: 4,
                  }}
                >
                  <a href={`/projects/${step.project?.slug || ''}/votes`}>{chunks}</a>
                </span>
              ),
            },
          ),
        })
      } else if (!isInterpellation) {
        toast({
          variant: 'success',
          content: intl.formatMessage({
            id: 'vote.add_success',
          }),
        })
      }
    })
  }

  const onHide = () => {
    dispatch(closeVoteModal())
    focusOnClose(proposal?.id)
  }

  const keyTradForModalVoteTitle = 'proposal.validate.vote'
  let votesHelpText =
    step.isSecretBallot && !step.publishedVoteDate && !step.canDisplayBallot
      ? intl.formatMessage({
          id: 'publish-ballot-no-date-help-text',
        })
      : ''
  votesHelpText =
    step.isSecretBallot && step.publishedVoteDate && !step.canDisplayBallot
      ? intl.formatMessage(
          {
            id: 'publish-ballot-date-help-text',
          },
          {
            date: moment(step.publishedVoteDate).format('DD/MM/YYYY'),
            time: moment(step.publishedVoteDate).format('HH:mm'),
          },
        )
      : votesHelpText

  if (step.votesHelpText) {
    votesHelpText = votesHelpText ? `${votesHelpText} ${step.votesHelpText}` : `${step.votesHelpText}`
  }

  if (!showModal) {
    return null
  }

  return (
    <ProposalVoteModalContainer
      baseId="proposal-vote-modal"
      id="proposal-vote-modal"
      onClose={onHide}
      ariaLabel="contained-modal-title-lg"
      size={CapUIModalSize.Md}
      fullSizeOnMobile
      show={showModal}
      hideOnClickOutside={false}
    >
      <>
        <ResetCss>
          <Modal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
            <Heading>
              {intl.formatMessage({
                id: 'proposal.validate.votes',
              })}
            </Heading>
          </Modal.Header>
        </ResetCss>

        <Modal.Body mt={[4, 'auto']}>
          <Flex direction="column" align="flex-start" spacing={6}>
            <VoteMinAlert step={step} translationKey={keyTradForModalVoteTitle} /> {/** @ts-ignore */}
            <ProposalsUserVotesTable onSubmit={onSubmit} step={step} votes={step.viewerVotes} />
            {votesHelpText && <ProposalModalVoteHelpText step={step} votesHelpText={votesHelpText} />}
          </Flex>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            variantColor="primary"
            variantSize="big"
            id="confirm-proposal-vote"
            onClick={() => {
              dispatch(submit(getFormName(step)))
            }}
          >
            {intl.formatMessage({
              id: !remainingVotesAfterValidation ? 'validate-participation' : 'keep-voting',
            })}
          </Button>
        </Modal.Footer>
      </>
    </ProposalVoteModalContainer>
  )
}
export default ProposalVoteModal
