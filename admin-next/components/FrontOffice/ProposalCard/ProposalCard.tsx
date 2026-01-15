import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import {
  BoxProps,
  Card,
  CapUIIcon,
  CardCoverImage,
  CardCoverPlaceholder,
  CardCover,
  CardContent,
  CardProps,
  CapUIShadow,
  CardTagList,
  Flex,
  Icon,
  Text,
  Tag,
} from '@cap-collectif/ui'
import { ProposalCard_proposal$key } from '@relay/ProposalCard_proposal.graphql'
import stripHTML from '@shared/utils/stripHTML'
import convertIconToDs from '@shared/utils/convertIconToDs'
import { useQueryState } from 'nuqs'
import { ProposalCard_step$key } from '@relay/ProposalCard_step.graphql'
import { VoteButton } from '@components/FrontOffice/VoteButton/VoteButton'

type Props = BoxProps & {
  proposal: ProposalCard_proposal$key
  step: ProposalCard_step$key
  format?: CardProps['format']
  primaryInfoTag?: React.ElementType
  active?: boolean
  triggerRequirementModal: (id: string) => void
}

const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalCard_proposal on Proposal @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    id
    title
    media {
      url
    }
    url
    body
    summary
    category {
      icon
      color
      categoryImage {
        image {
          url
        }
      }
    }
    comments {
      totalCount
    }
    author {
      username
    }
    viewerVote(step: $stepId) {
      ranking
    }
    estimation
    ...VoteButton_proposal @arguments(isAuthenticated: $isAuthenticated)
  }
`

const STEP_FRAGMENT = graphql`
  fragment ProposalCard_step on ProposalStep @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    id
    votable
    budget
    votesRanking
    votesLimit
    votesMin
    allProposals: proposals {
      totalCount
    }
    ...VoteButton_step @arguments(isAuthenticated: $isAuthenticated)
  }
`

export const ProposalCard: React.FC<Props> = ({
  proposal: proposalKey,
  step: stepFragment,
  primaryInfoTag,
  active,
  triggerRequirementModal,
  ...props
}) => {
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalKey)
  const step = useFragment(STEP_FRAGMENT, stepFragment)
  const { id, title, url, media, summary, body, category } = proposal
  const summaryOrBodyExcerpt = stripHTML((summary ?? body ?? '') as string) || ''

  const proposalCover = media?.url || category?.categoryImage?.image?.url
  const proposalIcon = category?.icon ? convertIconToDs(category?.icon) : CapUIIcon.CommentO
  const proposalColor = category?.color || 'neutral-gray.base'
  const maxPoints = step.votesLimit !== null ? step.votesLimit : step.votesMin

  const [listView] = useQueryState('list_view', { defaultValue: 'grid' })

  return (
    <Card
      id={`cap-proposal-card-${id}`}
      format={listView === 'grid' ? 'vertical' : 'horizontal'}
      hasButton={step?.votable}
      minWidth="unset"
      className={'cap-proposal-card' + (active ? ' active' : '')}
      sx={{ boxShadow: active ? CapUIShadow.Small : 'inherit' }}
      {...props}
    >
      <CardCover>
        {proposalCover ? (
          <CardCoverImage src={proposalCover} />
        ) : (
          <CardCoverPlaceholder icon={proposalIcon} color={proposalColor} />
        )}
      </CardCover>
      <CardContent primaryInfo={title} secondaryInfo={summaryOrBodyExcerpt} href={url} primaryInfoTag={'h2'}>
        <CardTagList>
          <Flex justifyContent="space-between" align="center" width="100%">
            <Flex align="center" gap="md">
              <VoteButton proposal={proposal} step={step} triggerRequirementModal={triggerRequirementModal} />
              {step.budget !== null ? (
                <Tag variantColor="infoGray" transparent>
                  <Icon name={CapUIIcon.Budget} />
                  <Text>{proposal.estimation}€</Text>
                </Tag>
              ) : step.votesRanking && proposal.viewerVote?.ranking !== null ? (
                <Tag variantColor="infoGray" transparent>
                  <Icon name={CapUIIcon.Trophy} />
                  <Text>
                    {proposal.viewerVote?.ranking !== undefined ? maxPoints - proposal.viewerVote?.ranking : 0}
                  </Text>
                </Tag>
              ) : (
                <Tag variantColor="infoGray" transparent>
                  <Icon name={CapUIIcon.BubbleO} />
                  <Text>{proposal.comments.totalCount}</Text>
                </Tag>
              )}
            </Flex>
            {proposal?.author ? (
              <Tag variantColor="infoGray" transparent>
                <Icon name={CapUIIcon.UserO} />
                <Text>{proposal?.author?.username}</Text>
              </Tag>
            ) : null}
          </Flex>
        </CardTagList>
      </CardContent>
    </Card>
  )
}

export default ProposalCard
