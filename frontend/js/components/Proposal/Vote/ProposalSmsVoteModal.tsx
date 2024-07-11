import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { CapUIModalSize } from '@cap-collectif/ui'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { closeVoteModal } from '~/redux/modules/proposal'
import type { GlobalState } from '~/types'
import { ProposalVoteMultiModalContainer } from './ProposalVoteModal.style'
import ProposalVoteSmsConfirmationModal from '~/components/Proposal/Vote/ProposalVoteModals/ProposalVoteSmsConfirmationModal'
import type { ProposalSmsVoteModal_proposal$key } from '~relay/ProposalSmsVoteModal_proposal.graphql'
import type { ProposalSmsVoteModal_step$key } from '~relay/ProposalSmsVoteModal_step.graphql'
import ProposalSmsVoteSuggestionsModal from '~/components/Proposal/Vote/ProposalSmsVoteSuggestionsModal'
import ProposalVoteSendSmsModal from '~/components/Proposal/Vote/ProposalVoteModals/ProposalVoteSendSmsModal'
import focusOnClose from './utils/focusOnClose'

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
  }
`
const STEP_FRAGMENT = graphql`
  fragment ProposalSmsVoteModal_step on ProposalStep @argumentDefinitions(token: { type: "String" }) {
    id
    votesRanking
    ...interpellationLabelHelper_step @relay(mask: false)
    ...ProposalSmsVoteSuggestionsModal_step @arguments(token: $token)
    ...ProposalVoteSmsConfirmationModal_step
  }
`
export const ProposalSmsVoteModal = ({ proposal: proposalRef, step: stepRef }: Props) => {
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const { currentVoteModal } = useSelector((state: GlobalState) => state.proposal)
  const showModal = !!currentVoteModal && currentVoteModal === proposal.id
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [status, setStatus] = React.useState<Status>(null)

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

  if (!showModal) {
    return null
  }

  return (
    <ProposalVoteMultiModalContainer
      baseId="proposal-vote-modal"
      id="proposal-vote-modal"
      onClose={onHide}
      aria-labelledby="modal-title"
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
        setStatus={setStatus}
      />
      <ProposalSmsVoteSuggestionsModal status={status} step={step} proposal={proposal} />
    </ProposalVoteMultiModalContainer>
  )
}
export default ProposalSmsVoteModal
