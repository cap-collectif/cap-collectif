// @flow
import * as React from 'react'
import {
  Box,
  Button,
  CapUIIcon,
  CapUISpotIcon,
  CapUISpotIconSize, Flex, Heading,
  MultiStepModal,
  SpotIcon,
  Text, useMultiStepModal
} from '@cap-collectif/ui'
import {useIntl} from "react-intl";
import {graphql, useFragment} from "react-relay";
import ResetCss from "~/utils/ResetCss";
import type {Status} from "~/components/Proposal/Vote/ProposalSmsVoteModal";
import type {ProposalSmsVoteSuggestionsModal_step$key} from '~relay/ProposalSmsVoteSuggestionsModal_step.graphql';
import type {ProposalSmsVoteSuggestionsModal_proposal$key} from '~relay/ProposalSmsVoteSuggestionsModal_proposal.graphql';

type Props = {|
  +status: Status,
  +step: ProposalSmsVoteSuggestionsModal_step$key,
  +proposal: ProposalSmsVoteSuggestionsModal_proposal$key,
|}

const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalSmsVoteSuggestionsModal_proposal on Proposal {
    id
  }
`;

const STEP_FRAGMENT = graphql`
  fragment ProposalSmsVoteSuggestionsModal_step on ProposalStep
  {
    proposalsList: proposals {
      edges {
        node {
          id
          url
        }
      }
    }
  }
`;

const ProposalSmsVoteSuggestionsModal = (props: Props) => {
  const {
    status,
    step: stepRef,
    proposal: proposalRef,
  } = props

  const intl = useIntl();
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef);
  const step = useFragment(STEP_FRAGMENT, stepRef);
  const { hide } = useMultiStepModal();

  const proposalsNode = step.proposalsList.edges?.filter(Boolean).map(edge => edge.node) ?? [];
  const currentProposalIndex = proposalsNode
    .findIndex(p => p.id === proposal.id);
  const nextProposal = proposalsNode[currentProposalIndex + 1] ?? null;

  const modalTitle = {
    'VOTE_LIMIT_REACHED': 'rejected-vote',
    'PROPOSAL_ALREADY_VOTED': 'duplicate-detected',
    'SUCCESS': 'verification-completed'
  }

  return (
    <>
      <ResetCss>
        <MultiStepModal.Header>
          {
            status && <Heading>{intl.formatMessage({ id: modalTitle[status] })}</Heading>
          }
        </MultiStepModal.Header>
      </ResetCss>
      <MultiStepModal.Body>
        <Flex
          direction="column"
          align="center"
          id="proposal-vote-sms-result"
          validationLabel={intl.formatMessage({ id: 'global.close' })}
        >
          {
            status === 'VOTE_LIMIT_REACHED' && (
              <>
                <SpotIcon name={CapUISpotIcon.PROHIBITED} size={CapUISpotIconSize.Lg} mb={2} />
                <Text>{intl.formatMessage({id: 'you-reached-max-votes'})}</Text>
              </>
            )
          }
          {
            status === 'PROPOSAL_ALREADY_VOTED' && (
              <>
                <Box mb={4}>
                  <Text fontWeight="bold">{intl.formatMessage({id: 'rejected-vote'})}</Text>
                </Box>
                <Box mb={4}>
                  <Text>{intl.formatMessage({id: 'rejected-vote-help'})}</Text>
                </Box>
                <Button rightIcon={CapUIIcon.LongArrowRight} variantSize="big">{intl.formatMessage({id: 'navigation.next.proposition'})}</Button>
              </>
            )
          }
          {
            status === 'SUCCESS' && (
              <>
                <Box mb={4}>
                  <Text fontWeight="bold">{intl.formatMessage({id: 'your-vote-has-been-validated'})}</Text>
                </Box>
                {
                  nextProposal?.url && (
                    <>
                      <Box mb={4}>
                        <Text>{intl.formatMessage({id: 'discover-other-proposals'})}</Text>
                      </Box>
                      <Button
                        rightIcon={CapUIIcon.LongArrowRight}
                        variantSize="big"
                        onClick={() => {
                          window.location.href = nextProposal.url
                        }}
                      >
                        {intl.formatMessage({id: 'navigation.next.proposition'})}
                      </Button>
                    </>
                  )
                }
              </>
            )
          }
        </Flex>
      </MultiStepModal.Body>
      <MultiStepModal.Footer>
        <Button
          onClick={hide}
          variant="secondary"
          variantColor="primary"
          variantSize="medium"
        >
          {intl.formatMessage({ id: 'global.close' })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}

export default ProposalSmsVoteSuggestionsModal