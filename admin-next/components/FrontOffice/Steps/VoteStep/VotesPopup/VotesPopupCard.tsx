import {
  Button,
  CapUIIcon,
  Card,
  CardContent,
  CardCover,
  CardCoverImage,
  CardCoverPlaceholder,
  Flex,
  Icon,
  useTheme,
} from '@cap-collectif/ui'
import { FC, useState } from 'react'
import VotesPopupCardRanking from './VotesPopupCardRanking'
import { graphql, useFragment } from 'react-relay'
import { VotesPopupCard_proposalStep$key } from '@relay/VotesPopupCard_proposalStep.graphql'
import { VotesPopupCard_proposalVote$key } from '@relay/VotesPopupCard_proposalVote.graphql'
import RemoveProposalVoteMutation from '@mutations/RemoveProposalVoteMutation'
import RemoveProposalSmsVoteMutation from '@mutations/RemoveProposalSmsVoteMutation'
import convertIconToDs from '@shared/utils/convertIconToDs'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import CookieMonster from '@shared/utils/CookieMonster'

interface Props {
  step: VotesPopupCard_proposalStep$key
  vote: VotesPopupCard_proposalVote$key
}

const VOTE_FRAGMENT = graphql`
  fragment VotesPopupCard_proposalVote on ProposalVote {
    id
    ...VotesPopupCardRanking_vote
    proposal {
      id
      title
      estimation
      media {
        url
      }
      category {
        icon
        color
        categoryImage {
          image {
            url
          }
        }
      }
      form {
        usingIllustration
      }
    }
  }
`

const STEP_FRAGMENT = graphql`
  fragment VotesPopupCard_proposalStep on ProposalStep {
    id
    ...VotesPopupCardRanking_step
    votesRanking
    votesMin
  }
`

const VotesPopupCard: FC<Props> = ({ step: stepKey, vote: voteKey }) => {
  const vote = useFragment(VOTE_FRAGMENT, voteKey)
  const step = useFragment(STEP_FRAGMENT, stepKey)
  const { viewerSession } = useAppContext()
  const [isLoading, setIsLoading] = useState(false)

  const { colors } = useTheme()

  const { proposal } = vote
  const proposalCover = proposal.media?.url || proposal.category?.categoryImage?.image?.url
  const proposalIcon = proposal.category?.icon ? convertIconToDs(proposal.category.icon) : undefined
  const proposalColor = proposal.category?.color || undefined

  const removeVote = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      if (viewerSession) {
        await RemoveProposalVoteMutation.commit(
          {
            input: {
              proposalId: vote.proposal.id,
              stepId: step.id,
            },
            stepId: step.id,
          },
          {
            proposalId: vote.proposal.id,
            stepId: step.id,
            voteId: vote.id,
          },
          false,
        )
      } else {
        await RemoveProposalSmsVoteMutation.commit({
          input: {
            proposalId: vote.proposal.id,
            stepId: step.id,
            token: CookieMonster.getParticipantCookie(),
          },
          stepId: step.id,
        }, false)
      }
    } catch {
      // The optimistic Relay update is automatically reverted on failure.
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex gap="sm" width="100%" pl="xs" py="xs" alignItems="center">
      {step.votesRanking && <VotesPopupCardRanking vote={vote} step={step} />}
      <Card format="horizontal" p="0" _hover={{ boxShadow: 'none' }}>
        {!step.votesRanking && (proposal.form?.usingIllustration || (proposalIcon && proposalCover)) ? (
          <CardCover width="auto" maxWidth="none" height="66px" sx={{ aspectRatio: '3/2' }}>
            {proposalCover ? (
              <CardCoverImage src={proposalCover} />
            ) : (
              <CardCoverPlaceholder icon={proposalIcon} color={proposalColor} />
            )}
          </CardCover>
        ) : null}
        <CardContent
          flex="1"
          primaryInfo={vote.proposal.title}
          sx={
            {
              '& .cap-card-primaryInfo': {
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              },
            } as any
          }
        />
      </Card>
      <Button
        variant="tertiary"
        variantColor="hierarchy"
        onClick={removeVote}
        disabled={isLoading}
        isLoading={isLoading}
        sx={{ '&:hover': { color: colors.danger.base + '!important' } }}
      >
        <Icon name={CapUIIcon.TrashO} />
      </Button>
    </Flex>
  )
}

export default VotesPopupCard
