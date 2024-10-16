import * as React from 'react'
import { commitLocalUpdate, graphql, useFragment } from 'react-relay'
import { CapUIModalSize, toast } from '@cap-collectif/ui'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { closeVoteModal, vote } from '~/redux/modules/proposal'
import type { GlobalState } from '~/types'
import { ProposalVoteMultiModalContainer } from './ProposalVoteModal.style'
import ProposalVoteSmsConfirmationModal
  from '~/components/Proposal/Vote/ProposalVoteModals/ProposalVoteSmsConfirmationModal'
import type { ProposalSmsVoteModal_proposal$key } from '~relay/ProposalSmsVoteModal_proposal.graphql'
import type { ProposalSmsVoteModal_step$key } from '~relay/ProposalSmsVoteModal_step.graphql'
import ProposalVoteSendSmsModal from '~/components/Proposal/Vote/ProposalVoteModals/ProposalVoteSendSmsModal'
import focusOnClose from './utils/focusOnClose'
import invariant from '~/utils/invariant'
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper'
import { useIntl } from 'react-intl'
import moment from 'moment/moment'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import CookieMonster from '@shared/utils/CookieMonster'
import environment from '~/createRelayEnvironment'
import { ConnectionHandler } from 'relay-runtime'
import usePrevious from '~/utils/hooks/usePrevious'
import { ProposalVoteMultiStepModalContainer } from '~/components/Proposal/Vote/ProposalVoteModals/ProposalVoteMultiStepModalContainer'


type Props = {
  proposal: ProposalSmsVoteModal_proposal$key
  step: ProposalSmsVoteModal_step$key
}
export type Status = 'SUCCESS' | 'VOTE_LIMIT_REACHED' | 'PROPOSAL_ALREADY_VOTED' | null
const PROPOSAL_FRAGMENT = graphql`
    fragment ProposalSmsVoteModal_proposal on Proposal {
        id
        ...ProposalSmsVoteSuggestionsModal_proposal
        ...ProposalVoteSmsConfirmationModal_proposal
        ...ProposalVoteMultiStepModalContainer_proposal
    }
`
const STEP_FRAGMENT = graphql`
    fragment ProposalSmsVoteModal_step on ProposalStep @argumentDefinitions(token: { type: "String" }) {
        id
        isSecretBallot
        publishedVoteDate
        canDisplayBallot
        votesHelpText
        votesRanking
        votesMin
        ...ProposalsUserVotesTable_step @arguments(token: $token)
        viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
            totalCount
        }
        ...VoteMinAlert_step @arguments(token: $token)
        ...interpellationLabelHelper_step @relay(mask: false)
        ...ProposalVoteSmsConfirmationModal_step
        ...ProposalVoteMultiStepModalContainer_step @arguments(token: $token)
        ...ProposalSmsVoteSuggestionsModal_step @arguments(token: $token)
    }
`
export const ProposalSmsVoteModal = ({ proposal: proposalRef, step: stepRef }: Props) => {
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const { currentVoteModal } = useSelector((state: GlobalState) => state.proposal)
  const showModal = !!currentVoteModal && currentVoteModal === proposal.id
  const prevShowModal = usePrevious(showModal)
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const intl = useIntl()
  const isVoteMin = useFeatureFlag('votes_min')
  const token = CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone()

  const onHide = () => {
    dispatch(closeVoteModal())
    focusOnClose(proposal?.id)
  }

  const smsVoteForm = useForm<any>({
    mode: 'onChange',
    defaultValues: {
      countryCode: '+33',
      phone: '',
      consentSmsCommunication: false,
      proposalId: proposal.id,
      stepId: step.id,
    },
  })

  const createTmpVote = React.useCallback(() => {
    commitLocalUpdate(environment as any, store => {
      const dataID = `client:newTmpVote:${proposal.id}`
      let newNode: any = store.get(dataID)

      if (!newNode) {
        newNode = store.create(dataID, 'ProposalVote')
      }

      newNode.setValue(true, 'published')

      newNode.setValue(false, 'anonymous')
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
      console.log(connection, args)

      if (!connection) {
        return
      }

      ConnectionHandler.insertEdgeAfter(connection, newEdge)
    })
  }, [proposal.id, step.id, token])

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

  if (!showModal) {
    return null
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
    return vote(dispatch, step.id, proposal.id, !tmpVote.public, intl, false, token).then(data => {

      const vote = data?.addProposalVote?.voteEdge?.node ?? data?.addProposalSmsVote?.voteEdge?.node

      if (!vote) {
        invariant(false, 'The vote id is missing.')
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
              id: hasJustFinished ? 'participation-validated-anonymous' : 'vote-for-x-proposals',
            },
            {
              num: remainingVotesAfterValidation,
              div: (...chunks) => <div>{chunks}</div>,
              b: (...chunks) => <b>{chunks}</b>,
            },
          ),
        })
      } else if (!isInterpellation)
        toast({
          variant: 'success',
          content: intl.formatMessage({
            id: 'vote.add_success',
          }),
        })
    })
  }


  return (
    <ProposalVoteMultiModalContainer
      ariaLabel="vote-multi-modal-container"
      baseId="proposal-vote-modal"
      id="proposal-vote-modal"
      onClose={onHide}
      size={CapUIModalSize.Lg}
      fullSizeOnMobile
      show={showModal}
    >
      <ProposalVoteSendSmsModal form={smsVoteForm} setIsLoading={setIsLoading} />
      <ProposalVoteSmsConfirmationModal
        countryCode={smsVoteForm.watch('countryCode')}
        phone={smsVoteForm.watch('phone')}
        consentSmsCommunication={smsVoteForm.watch('consentSmsCommunication')}
        proposal={proposal}
        step={step}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      <ProposalVoteMultiStepModalContainer
        proposal={proposal}
        keyTradForModalVoteTitle={keyTradForModalVoteTitle}
        onHide={onHide}
        remainingVotesAfterValidation={remainingVotesAfterValidation}
        showModal={showModal}
        step={step}
        votesHelpText={votesHelpText}
        onSubmit={onSubmit}
      />
    </ProposalVoteMultiModalContainer>
  )
}
export default ProposalSmsVoteModal
