import * as React from 'react'
import { Heading, VoteInfo, Text, Box, Button } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import stripHtml from '@shared/utils/stripHTML'
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext'
import { View } from '../../utils'
import { formatBigNumber } from '~/utils/bigNumberFormatter'
import CheckInfo from '@shared/ui/CheckInfo'

export const SimpleVote = ({ label, votesHelpText }: { label: string; votesHelpText: string }) => (
  <VoteInfo borderRadius="accordion">
    <VoteInfo.Header>
      <VoteInfo.Header.Label>{label}</VoteInfo.Header.Label>
    </VoteInfo.Header>
    <VoteInfo.Body>
      <Text>{stripHtml(votesHelpText)}</Text>
    </VoteInfo.Body>
  </VoteInfo>
)

export const VoteValidated = ({
  isVoteComplete,
  label,
  votesHelpText,
  hasVoteMin,
  votesMin,
  votesLimit,
  viewerVotes,
  votesRanking,
}: {
  isVoteComplete: boolean
  label: string
  votesHelpText: string
  hasVoteMin: boolean
  votesMin: number
  votesLimit: number
  viewerVotes: number
  votesRanking: boolean
}) => {
  const { setView } = useVoteStepContext()
  const intl = useIntl()

  return (
    <VoteInfo borderRadius="accordion">
      <VoteInfo.Header infoLabel={stripHtml(votesHelpText)}>
        <VoteInfo.Header.Label>{label}</VoteInfo.Header.Label>
        <Heading>
          {intl.formatMessage({
            id: isVoteComplete ? 'vote_step.participation_complete' : 'vote_step.participation_validated',
          })}
        </Heading>
      </VoteInfo.Header>
      <VoteInfo.Body>
        <Text lineHeight="normal">
          {isVoteComplete ? (
            intl.formatMessage({ id: 'vote_step.complete_body' })
          ) : (
            <>
              {votesRanking ? (
                <Box mb={2}>
                  {intl.formatMessage(
                    { id: 'vote_step.rank_your_favorites_proposals' },
                    {
                      a: (...chunks) => (
                        <>
                          <Button variant="link" onClick={() => setView(View.Votes)}>
                            {chunks.join('')}
                          </Button>
                          <br />
                        </>
                      ),
                    },
                  )}
                </Box>
              ) : null}
              {hasVoteMin ? (
                <CheckInfo
                  checked
                  cross
                  label={intl.formatMessage({ id: 'vote_step.vote_min_checked' }, { num: votesMin })}
                />
              ) : null}
              {votesRanking ? (
                <CheckInfo cross label={intl.formatMessage({ id: 'vote_step.rank_your_proposals' })} />
              ) : null}
              {votesLimit ? (
                <CheckInfo
                  cross
                  checked={votesLimit === viewerVotes}
                  label={intl.formatMessage({ id: 'vote_step.vote_max_checked' }, { num: votesLimit - viewerVotes })}
                />
              ) : null}
            </>
          )}
        </Text>
      </VoteInfo.Body>
    </VoteInfo>
  )
}

export const VoteMinMax = ({
  label,
  votesHelpText,
  hasVoteMin,
  votesMin,
  votesLimit,
  viewerVotes,
}: {
  label: string
  votesHelpText: string
  hasVoteMin: boolean
  votesMin: number
  votesLimit: number
  viewerVotes: number
}) => {
  const intl = useIntl()

  return (
    <VoteInfo borderRadius="accordion">
      <VoteInfo.Header infoLabel={stripHtml(votesHelpText)}>
        <VoteInfo.Header.Label>{label}</VoteInfo.Header.Label>
        <Heading>
          {intl.formatMessage(
            { id: 'vote_step.vote_count_info' },
            { num: hasVoteMin ? votesMin - viewerVotes : votesLimit - viewerVotes },
          )}
        </Heading>
      </VoteInfo.Header>
      <VoteInfo.Body>
        {hasVoteMin ? <Text lineHeight="normal">{intl.formatMessage({ id: 'vote_step.to_validate' })}</Text> : null}
      </VoteInfo.Body>
      <VoteInfo.ProgressBar totalSteps={hasVoteMin ? votesMin : votesLimit} currentStep={viewerVotes - 1} />
    </VoteInfo>
  )
}

export const VoteBudget = ({
  label,
  votesHelpText,
  creditsLeft,
  viewerVotes,
}: {
  label: string
  votesHelpText: string
  viewerVotes: number
  creditsLeft: number
}) => {
  const intl = useIntl()

  // TODO Vote budget anonyme
  return (
    <VoteInfo borderRadius="accordion">
      <VoteInfo.Header infoLabel={stripHtml(votesHelpText)}>
        <VoteInfo.Header.Label>{label}</VoteInfo.Header.Label>
        <Heading>
          {intl.formatMessage(
            { id: creditsLeft ? 'vote_step.remaining_budget' : 'vote_step.participation_complete' },
            { num: formatBigNumber(creditsLeft || 0) },
          )}
        </Heading>
      </VoteInfo.Header>
      <VoteInfo.Body>
        <Text lineHeight="normal">
          {creditsLeft
            ? intl.formatMessage(
                { id: viewerVotes ? 'vote_step.budget_started' : 'vote_step.budget_no_vote' },
                { num: viewerVotes },
              )
            : intl.formatMessage({ id: 'vote_step.complete_body' })}
        </Text>
      </VoteInfo.Body>
      {creditsLeft ? <VoteInfo.ProgressBar totalSteps={2} currentStep={!viewerVotes ? -1 : 0} /> : null}
    </VoteInfo>
  )
}
