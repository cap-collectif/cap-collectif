import React from 'react'
import { Button, Flex, Heading, MultiStepModal, toast } from '@cap-collectif/ui'
import ResetCss from '~/utils/ResetCss'
import { useIntl } from 'react-intl'
import VoteMinAlert from '~/components/Project/Votes/VoteMinAlert'
import { graphql, useFragment } from 'react-relay'
import ProposalsUserVotesTable from '~/components/Project/Votes/ProposalsUserVotesTable'
import type { AddProposalSmsVoteMutation$data } from '~relay/AddProposalSmsVoteMutation.graphql'
import AddProposalSmsVoteMutation from '~/mutations/AddProposalSmsVoteMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import CookieMonster from '@shared/utils/CookieMonster'
import { ProposalVoteMultiStepModalContainer_step$key } from '~relay/ProposalVoteMultiStepModalContainer_step.graphql'
import {
  ProposalVoteMultiStepModalContainer_proposal$key,
} from '~relay/ProposalVoteMultiStepModalContainer_proposal.graphql'
import { ProposalModalVoteHelpText } from '~/components/Proposal/Vote/ProposalModalVoteHelpText'


type Props = {
  onHide: () => void,
  showModal: boolean,
  step: ProposalVoteMultiStepModalContainer_step$key,
  proposal: ProposalVoteMultiStepModalContainer_proposal$key,
  keyTradForModalVoteTitle: string,
  votesHelpText: string,
  remainingVotesAfterValidation: number
  onSubmit: (values: { votes: Array<{ public: boolean; id: string; }>; }) => Promise<void>

}

const STEP_FRAGMENT = graphql`
    fragment ProposalVoteMultiStepModalContainer_step on ProposalStep @argumentDefinitions(token: { type: "String" }) {
        id
        votesMin
        votesLimit
        ...VoteMinAlert_step @arguments(token: $token)
        ...ProposalsUserVotesTable_step @arguments(token: $token)
        viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
            ...ProposalsUserVotesTable_votes
        }
    }
`

const PROPOSAL_FRAGMENT = graphql`
    fragment ProposalVoteMultiStepModalContainer_proposal on Proposal {
        id
    }
`

export const ProposalVoteMultiStepModalContainer = (
  {
    onHide,
    step: stepRef,
    proposal: proposalRef,
    keyTradForModalVoteTitle,
    votesHelpText,
    remainingVotesAfterValidation,
    onSubmit,
  }: Props,
) => {
  const intl = useIntl()
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)

  const onClick = async () => {

    const token = CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone() ?? localStorage.getItem('AnonVoteToken')
    const  consentSmsCommunication = localStorage.getItem('consentSmsCommunication') === '1';

    const addProposalSmsVoteResponse: AddProposalSmsVoteMutation$data = await AddProposalSmsVoteMutation.commit({
      input: {
        token,
        proposalId: proposal?.id,
        stepId: step?.id,
        consentSmsCommunication,
      },
      token,
    })
    const addSmsVoteErrorCode = addProposalSmsVoteResponse.addProposalSmsVote?.errorCode ?? null

    if (addSmsVoteErrorCode === 'PHONE_NOT_FOUND') {
      return mutationErrorToast(intl)
    }

    CookieMonster.addAnonymousAuthenticatedWithConfirmedPhone(token)
    localStorage.removeItem('AnonVoteToken')

    if (['VOTE_LIMIT_REACHED', 'PROPOSAL_ALREADY_VOTED', 'PHONE_ALREADY_USED'].includes(addSmsVoteErrorCode)) {
      const errorMapping = {
        'VOTE_LIMIT_REACHED': {
          id: 'proposal.vote.popover.limit_reached_text',
          params: {num: step.votesLimit}
        },
        'PROPOSAL_ALREADY_VOTED': {
          id: 'rejected-vote-choose-another-one',
          params: {}
        },
        'PHONE_ALREADY_USED': {
          id: 'phone.already.used.in.this.step',
          params: {}
        }
      }

      const {id, params} = errorMapping[addSmsVoteErrorCode]

      onHide()
      toast({
        variant: 'danger',
        content: intl.formatMessage({ id }, params)
      })
      return;
    }

    const votesTotalCount = addProposalSmsVoteResponse?.addProposalSmsVote?.voteEdge?.node?.step?.viewerVotes?.totalCount ?? 0
    const votesMin = step?.votesMin
    const remainingVotesAfterValidation = votesMin - votesTotalCount

    const hasFinished = remainingVotesAfterValidation < 0
    const hasJustFinished = remainingVotesAfterValidation === 0

    if (votesMin > 1 && (!hasFinished || hasJustFinished)) {
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
    } else {
      toast({
        variant: 'success',
        content: intl.formatMessage({
          id: 'vote.add_success',
        }),
      })
    }


    onHide()
  }

  return (
    <>
      <ResetCss>
        <MultiStepModal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
          <Heading>
            {intl.formatMessage({
              id: 'proposal.validate.votes',
            })}
          </Heading>
        </MultiStepModal.Header>
      </ResetCss>
      <MultiStepModal.Body>
        <Flex direction="column" align="flex-start" spacing={6}>
          <VoteMinAlert step={step} translationKey={keyTradForModalVoteTitle} /> {/** @ts-ignore */}
          <ProposalsUserVotesTable onSubmit={onSubmit} step={step} votes={step.viewerVotes} />
          <ProposalModalVoteHelpText votesHelpText={votesHelpText} step={step}  />
        </Flex>
      </MultiStepModal.Body>
      <MultiStepModal.Footer>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          id="confirm-proposal-vote"
          onClick={onClick}
        >
          {intl.formatMessage({
            id: !remainingVotesAfterValidation ? 'validate-participation' : 'keep-voting',
          })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}



