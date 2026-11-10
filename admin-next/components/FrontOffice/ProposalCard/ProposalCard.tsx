import {
  BoxProps,
  CapUIIcon,
  CapUIShadow,
  Card,
  CardContent,
  CardCover,
  CardCoverImage,
  CardCoverPlaceholder,
  CardProps,
  CardStatusTag,
  CardTagLabel,
  CardTagList,
  Flex,
  Icon,
  Tag,
  Text,
  Tooltip,
} from '@cap-collectif/ui'
import { VoteButton } from '@components/FrontOffice/VoteButton/VoteButton'
import { ProposalCard_proposal$key } from '@relay/ProposalCard_proposal.graphql'
import { ProposalCard_step$key } from '@relay/ProposalCard_step.graphql'
import convertIconToDs from '@shared/utils/convertIconToDs'
import useIsMobile from '@shared/hooks/useIsMobile'
import stripHTML from '@shared/utils/stripHTML'
import { getProposalAuthorDisplayName } from '@utils/proposalAuthor'
import { parseAsInteger, useQueryState } from 'nuqs'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'

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
    votes(stepId: $stepId, first: 0) {
      totalPointsCount
    }
    paperVotesTotalPointsCount(stepId: $stepId)
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
    __typename
    votable
    budget
    votesRanking
    votesLimit
    votesMin
    ... on CollectStep {
      mainView
    }
    ... on SelectionStep {
      project {
        firstCollectStep {
          mainView
        }
      }
    }
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
  const isMobile = useIsMobile()
  const intl = useIntl()
  const authorName = getProposalAuthorDisplayName(proposal.author)
  const { id, title, url, media, summary, body, category, form, status } = proposal
  const summaryOrBodyExcerpt = stripHTML((summary ?? body ?? '') as string) || ''

  const proposalCover = media?.url || category?.categoryImage?.image?.url
  const proposalIcon = category?.icon ? convertIconToDs(category?.icon) : undefined
  const proposalColor = category?.color || undefined

  const mainView =
    step.__typename === 'CollectStep'
      ? step.mainView
      : step.__typename === 'SelectionStep'
      ? step.project?.firstCollectStep?.mainView
      : undefined
  const defaultView = mainView === 'LIST' ? 'list' : 'grid'
  const [requestedView] = useQueryState('list_view', { defaultValue: defaultView })
  const listView = isMobile ? 'grid' : requestedView
  const [isMapShown] = useQueryState('map_shown', parseAsInteger)

  const descriptionLineClamp = isMapShown !== 0 ? 3 : 4
  const numericPointsCount = proposal.votes?.totalPointsCount ?? 0
  const paperPointsCount = proposal.paperVotesTotalPointsCount ?? 0
  const pointsTooltip =
    numericPointsCount + paperPointsCount > 0 ? (
      <>
        {intl.formatMessage({ id: 'numeric-points-count' }, { num: numericPointsCount })}
        {paperPointsCount > 0 && (
          <>
            <br />
            {intl.formatMessage({ id: 'paper-points-count' }, { num: paperPointsCount })}
          </>
        )}
      </>
    ) : null
  const pointsTag = (
    <Tag variantColor="infoGray" transparent>
      <Icon name={CapUIIcon.Trophy} />
      <Text>{numericPointsCount + paperPointsCount}</Text>
    </Tag>
  )

  return (
    <Card
      id={`proposal-${id}`}
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
            <CardStatusTag
              variantColor={STATUS_COLOR_MAP[status.color] ?? 'infoGray'}
              maxWidth="calc(100% - 16px)"
              sx={status.color === 'INFO' ? { bg: 'blue.150', color: 'blue.800' } : undefined}
            >
              <CardTagLabel overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {status.name}
              </CardTagLabel>
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
            '& .cap-card-link:focus': { outline: 'none' },
            '& .cap-card-link:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.base',
              borderRadius: '2px',
            },
          } as any
        }
      >
        <CardTagList>
          <Flex justifyContent="space-between" align="center" width="100%">
            <Flex align="center" gap="md" flexShrink={0}>
              {step.votable ? (
                <VoteButton proposal={proposal} step={step} triggerRequirementModal={triggerRequirementModal} />
              ) : null}
              {step.budget !== null ? (
                <Tag variantColor="infoGray" transparent>
                  <Icon name={CapUIIcon.Budget} />
                  <Text>{proposal.estimation}€</Text>
                </Tag>
              ) : step.votesRanking ? (
                pointsTooltip ? (
                  <Tooltip label={pointsTooltip}>{pointsTag}</Tooltip>
                ) : (
                  pointsTag
                )
              ) : (
                <Tag variantColor="infoGray" transparent flexShrink={0}>
                  <Icon name={CapUIIcon.BubbleO} />
                  <Text>{proposal.comments.totalCountWithAnswers}</Text>
                </Tag>
              )}
            </Flex>
            {proposal?.author ? (
              <Tag variantColor="infoGray" transparent flex={1} minWidth={0} ml="md" tooltipLabel={authorName}>
                <Icon name={CapUIIcon.UserO} flexShrink={0} />
                <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                  {authorName}
                </Text>
              </Tag>
            ) : null}
          </Flex>
        </CardTagList>
      </CardContent>
    </Card>
  )
}

export default ProposalCard
