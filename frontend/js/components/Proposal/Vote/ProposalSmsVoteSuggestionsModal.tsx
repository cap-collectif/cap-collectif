import * as React from 'react'
import {
  Box,
  Button,
  CapUISpotIcon,
  CapUISpotIconSize,
  Flex,
  Heading,
  MultiStepModal,
  SpotIcon,
  InfoMessage,
  Text,
  useMultiStepModal,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import ResetCss from '~/utils/ResetCss'
import type { Status } from '~/components/Proposal/Vote/ProposalSmsVoteModal'
import type { ProposalSmsVoteSuggestionsModal_step$key } from '~relay/ProposalSmsVoteSuggestionsModal_step.graphql'
import type { ProposalSmsVoteSuggestionsModal_proposal$key } from '~relay/ProposalSmsVoteSuggestionsModal_proposal.graphql'
import ProposalSuggestionCard from '~/components/Proposal/Vote/ProposalSuggestionCard'
import ProposalCategorySuggestionCard from '~/components/Proposal/Vote/ProposalCategorySuggestionCard'
type Props = {
  readonly status: Status
  readonly step: ProposalSmsVoteSuggestionsModal_step$key
  readonly proposal: ProposalSmsVoteSuggestionsModal_proposal$key
}
const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalSmsVoteSuggestionsModal_proposal on Proposal {
    id
    category {
      id
      name
    }
  }
`
const STEP_FRAGMENT = graphql`
  fragment ProposalSmsVoteSuggestionsModal_step on ProposalStep @argumentDefinitions(token: { type: "String" }) {
    url
    viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
      totalCount
      edges {
        node {
          id
          proposal {
            id
          }
        }
      }
    }
    form {
      categories(order: ALPHABETICAL) {
        id
        name
        color
        categoryImage {
          image {
            url
          }
        }
      }
    }
    proposalsList: proposals {
      edges {
        node {
          id
          title
          body
          summary
          url
          author {
            username
          }
        }
      }
    }
  }
`
const PROPOSAL_CARDS_COUNT = 6
const CATEGORY_CARDS_COUNT = 10

const ProposalSmsVoteSuggestionsModal = ({ status, step: stepRef, proposal: proposalRef }: Props) => {
  const intl = useIntl()
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const { hide } = useMultiStepModal()
  const proposals = step?.proposalsList.edges?.filter(Boolean).map(edge => edge.node) ?? []
  const votedProposalsIds =
    step?.viewerVotes.edges
      ?.filter(Boolean)
      .map(edge => edge.node)
      .map(vote => vote.proposal.id) ?? []
  const suggestedProposals = proposals.filter(p => !votedProposalsIds.includes(p.id)).slice(0, PROPOSAL_CARDS_COUNT)
  const suggestedCategories =
    step?.form?.categories
      ?.filter(category => category?.id !== proposal?.category?.id)
      ?.slice(0, CATEGORY_CARDS_COUNT) ?? []
  const modalTitle = {
    VOTE_LIMIT_REACHED: 'rejected-vote',
    PROPOSAL_ALREADY_VOTED: 'rejected-vote',
    SUCCESS: 'your-vote-has-been-validated',
  }
  return (
    <>
      <ResetCss>
        <MultiStepModal.Header>
          <Text uppercase color="neutral-gray.500" fontWeight={700} fontSize={1} lineHeight="sm">
            {intl.formatMessage({
              id: 'proposal.validate.vote',
            })}
          </Text>
          {status && (
            <Heading>
              {intl.formatMessage({
                id: modalTitle[status],
              })}
            </Heading>
          )}
        </MultiStepModal.Header>
      </ResetCss>
      <MultiStepModal.Body>
        <Box mb={6}>
          {status === 'SUCCESS' && (
            <Text>
              {intl.formatMessage({
                id: 'dont-stop-here-check-other-proposals',
              })}
            </Text>
          )}
          {status === 'PROPOSAL_ALREADY_VOTED' && (
            <InfoMessage variant="warning">
              <InfoMessage.Title withIcon>
                {intl.formatMessage({
                  id: 'rejected-vote-choose-another-one',
                })}
              </InfoMessage.Title>
            </InfoMessage>
          )}
          {status === 'VOTE_LIMIT_REACHED' && (
            <Flex align="center" direction="column">
              <SpotIcon name={CapUISpotIcon.PROHIBITED} size={CapUISpotIconSize.Lg} mb={2} />
              <Text>
                {intl.formatMessage({
                  id: 'you-reached-max-votes',
                })}
              </Text>
            </Flex>
          )}
        </Box>
        {(status === 'SUCCESS' || status === 'PROPOSAL_ALREADY_VOTED') && (
          <>
            {suggestedProposals.length > 0 && (
              <Box mb="56px">
                <Text>
                  {intl.formatMessage({
                    id: 'global.proposals',
                  })}
                </Text>
                <Flex overflow="auto" mt={4}>
                  {suggestedProposals.map(p => {
                    return <ProposalSuggestionCard key={p.id} proposal={p} />
                  })}
                </Flex>
              </Box>
            )}
            {suggestedCategories.length > 0 && (
              <Box>
                <Text>
                  {intl.formatMessage({
                    id: 'global.categories',
                  })}
                </Text>
                <Flex overflow="auto" my={4}>
                  {suggestedCategories.map(category => {
                    return <ProposalCategorySuggestionCard key={category.id} stepUrl={step.url} category={category} />
                  })}
                </Flex>
              </Box>
            )}
          </>
        )}
      </MultiStepModal.Body>
      <MultiStepModal.Footer>
        <Button onClick={hide} variant="secondary" variantColor="primary" variantSize="medium">
          {intl.formatMessage({
            id: 'global.close',
          })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}

export default ProposalSmsVoteSuggestionsModal
