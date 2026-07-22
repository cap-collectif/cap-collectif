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
  CardStatusTag,
  CardTagLabel,
  Flex,
  Icon,
  Text,
  Tag,
} from '@cap-collectif/ui'
import { ProposalCard_proposal$key } from '@relay/ProposalCard_proposal.graphql'
import stripHTML from '@shared/utils/stripHTML'
import convertIconToDs from '@shared/utils/convertIconToDs'
import { parseAsInteger, useQueryState } from 'nuqs'
import { ProposalCard_step$key } from '@relay/ProposalCard_step.graphql'
import { VoteButton } from '@components/FrontOffice/VoteButton/VoteButton'
import { getProposalAuthorDisplayName } from '@utils/proposalAuthor'

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
      totalCountWithAnswers
    }
    author {
      username
      displayName
    }
    viewerVote(step: $stepId) {
      ranking
    }
    status(step: $stepId) {
      name
      color
    }
    estimation
    form {
      usingIllustration
    }
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

const STATUS_COLOR_MAP: Record<string, 'info' | 'infoGray' | 'success' | 'warning' | 'danger'> = {
  INFO: 'info',
  PRIMARY: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  CAUTION: 'warning',
  DANGER: 'danger',
  DEFAULT: 'infoGray',
}

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
  const authorName = getProposalAuthorDisplayName(proposal.author)
  const { id, title, url, media, summary, body, category, form, status } = proposal
  const summaryOrBodyExcerpt = stripHTML((summary ?? body ?? '') as string) || ''

  const proposalCover = media?.url || category?.categoryImage?.image?.url
  const proposalIcon = category?.icon ? convertIconToDs(category?.icon) : undefined
  const proposalColor = category?.color || undefined
  const maxPoints = step.votesLimit !== null ? step.votesLimit : step.votesMin

  const [listView] = useQueryState('list_view', { defaultValue: 'grid' })
  const [isMapShown] = useQueryState('map_shown', parseAsInteger)

  const descriptionLineClamp = isMapShown !== 0 ? 3 : 4

  return (
    <Card
      id={`cap-proposal-card-${id}`}
      format={listView === 'grid' ? 'vertical' : 'horizontal'}
      hasButton={step?.votable}
      minWidth="unset"
      variantSize="medium"
      height={listView === 'list' ? 224 : '100%'}
      className={'cap-proposal-card' + (active ? ' active' : '')}
      sx={{ boxShadow: active ? CapUIShadow.Small : 'inherit' }}
      {...props}
    >
      {listView === 'grid' || form?.usingIllustration || (proposalIcon && proposalCover) ? (
        <CardCover alignSelf="stretch" maxWidth={listView === 'list' ? 288 : 'auto'} height="initial">
          {proposalCover ? (
            <CardCoverImage src={proposalCover} />
          ) : (
            <CardCoverPlaceholder icon={proposalIcon} color={proposalColor} />
          )}
          {status ? (
            <CardStatusTag variantColor={STATUS_COLOR_MAP[status.color] ?? 'infoGray'}>
              <CardTagLabel>{status.name}</CardTagLabel>
            </CardStatusTag>
          ) : null}
        </CardCover>
      ) : null}
      <CardContent
        primaryInfo={title}
        secondaryInfo={summaryOrBodyExcerpt}
        href={url}
        primaryInfoTag={'h2'}
        flex={1}
        sx={
          {
            '& .cap-card-primaryInfo': {
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            },
            '& .cap-card-primaryInfo ~ div': {
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: descriptionLineClamp,
              WebkitBoxOrient: 'vertical',
            },
          } as any
        }
      >
        <CardTagList>
          <Flex justifyContent="space-between" align="center" width="100%">
            <Flex align="center" gap="md">
              {step.votable ? (
                <VoteButton proposal={proposal} step={step} triggerRequirementModal={triggerRequirementModal} />
              ) : null}
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
                  <Text>{proposal.comments.totalCountWithAnswers}</Text>
                </Tag>
              )}
            </Flex>
            {proposal?.author ? (
              <Tag variantColor="infoGray" transparent>
                <Icon name={CapUIIcon.UserO} />
                <Text>{authorName}</Text>
              </Tag>
            ) : null}
          </Flex>
        </CardTagList>
      </CardContent>
    </Card>
  )
}

export default ProposalCard
