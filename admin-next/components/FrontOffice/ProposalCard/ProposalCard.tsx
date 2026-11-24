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
  CardRestricted,
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
import { isFeminineObjectType } from '@shared/constants/proposalStepObjectType'
import useIsMobile from '@shared/hooks/useIsMobile'
import convertIconToDs from '@shared/utils/convertIconToDs'
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
    isArchived
    form {
      usingIllustration
      commentable
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
    voteThreshold
    form {
      objectType
    }
    ... on CollectStep {
      mainView
      private
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

  const isPrivate = step.__typename === 'CollectStep' && !!step.private
  const descriptionLineClamp = isMapShown !== 0 ? 3 : 4
  // In a step with a vote threshold, the action line is dedicated to the gauge (or its outcome) and the vote button
  const hasVoteThreshold = Boolean(step.votable) && (step.voteThreshold ?? 0) > 0
  // The threshold outcome already tells an archived proposal apart, so the archived look is kept for the other steps
  const showArchivedState = proposal.isArchived && !hasVoteThreshold
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

  const showComments = !!form?.commentable
  // Left-side counters: vote button, then budget, points or comments
  const hasLeftCounters = step.votable || step.budget !== null || !!step.votesRanking || showComments

  const hasCover = listView === 'grid' || form?.usingIllustration || (proposalIcon && proposalCover)
  const privateBadge = isPrivate ? (
    <CardRestricted
      variant="square"
      icon={CapUIIcon.EyeClose}
      srOnlyText={intl.formatMessage({ id: 'global.private' })}
      tooltipLabel={intl.formatMessage({ id: 'global.private' })}
    />
  ) : null

  return (
    <Card
      id={`proposal-${id}`}
      format={listView === 'grid' ? 'vertical' : 'horizontal'}
      hasButton={step?.votable}
      isArchived={showArchivedState}
      minWidth="unset"
      variantSize="medium"
      height={listView === 'list' ? 224 : '100%'}
      className={'cap-proposal-card' + (active ? ' active' : '')}
      sx={{ boxShadow: active ? CapUIShadow.Small : 'inherit' }}
      {...props}
    >
      {hasCover ? (
        <CardCover alignSelf="stretch" maxWidth={listView === 'list' ? 288 : 'auto'} height="initial">
          {privateBadge}
          {proposalCover ? (
            <CardCoverImage src={proposalCover} />
          ) : (
            <CardCoverPlaceholder
              icon={proposalIcon}
              color={proposalColor}
              // The archived card darkens its placeholder, which only suits the icon variant:
              // behind the default illustration it would show as a dark edge
              {...(showArchivedState && !proposalIcon ? { backgroundColor: 'neutral-gray.100' } : {})}
            />
          )}
          {showArchivedState ? (
            <Flex
              className="cap-proposal-card-archived-tags"
              position="absolute"
              left="xs"
              bottom={listView === 'grid' ? '-sm' : undefined}
              top={listView === 'grid' ? undefined : 'xs'}
              gap="xs"
              maxWidth="calc(100% - 16px)"
            >
              {status ? (
                <Tag variantColor="infoGray" minWidth={0}>
                  <CardTagLabel overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    {status.name}
                  </CardTagLabel>
                </Tag>
              ) : null}
              <Tag variantColor="infoGray" flexShrink={0}>
                <CardTagLabel whiteSpace="nowrap">
                  {intl.formatMessage(
                    {
                      id: 'front.proposal.archived-tag',
                      defaultMessage: '{feminine, select, true {Archivée} other {Archivé}}',
                    },
                    { feminine: String(isFeminineObjectType(step.form?.objectType)) },
                  )}
                </CardTagLabel>
              </Tag>
            </Flex>
          ) : status ? (
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
      ) : (
        privateBadge
      )}
      <CardContent
        primaryInfo={title}
        secondaryInfo={summaryOrBodyExcerpt}
        href={url}
        primaryInfoTag={primaryInfoTag ?? 'h2'}
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
        {/* With a threshold, the action line sticks to the bottom to keem gauges and threshold aligned */}
        <CardTagList mt={hasVoteThreshold ? 'auto' : undefined}>
          {hasVoteThreshold ? (
            <Flex align="center" width="100%" minHeight="32px">
              <VoteButton proposal={proposal} step={step} triggerRequirementModal={triggerRequirementModal} />
            </Flex>
          ) : (
            <Flex justifyContent="space-between" align="center" width="100%">
              {hasLeftCounters ? (
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
                  ) : showComments ? (
                    <>
                      {/* The icon alone does not say what the number counts. The text stays outside the Tag:
                          Tag builds its title from its whole text content. */}
                      <span className="sr-only">
                        {intl.formatMessage({ id: 'global.comments' }, { num: proposal.comments.totalCountWithAnswers })}
                      </span>
                      <Tag variantColor="infoGray" transparent flexShrink={0} aria-hidden="true">
                        <Icon name={CapUIIcon.BubbleO} />
                        <Text>{proposal.comments.totalCountWithAnswers}</Text>
                      </Tag>
                    </>
                  ) : null}
                </Flex>
              ) : null}
              {proposal?.author ? (
                <>
                  <span className="sr-only">{intl.formatMessage({ id: 'global.author' })}</span>
                  {/* No tooltipLabel: it made the tag a keyboard stop repeating the visible name, once per card.
                      Tag still sets a native title with the full name, for truncated names. */}
                  <Tag variantColor="infoGray" transparent flex={1} minWidth={0} ml={hasLeftCounters ? 'md' : 0}>
                    <Icon name={CapUIIcon.UserO} flexShrink={0} />
                    <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {authorName}
                    </Text>
                  </Tag>
                </>
              ) : null}
            </Flex>
          )}
        </CardTagList>
      </CardContent>
    </Card>
  )
}

export default ProposalCard
