import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useParams } from 'react-router-dom'
import { useIntl } from 'react-intl'
import {
  Box,
  Card as DsCard,
  Flex,
  Heading,
  Icon,
  CapUIIconSize,
  Tag,
  Proposal,
  CapUIFontWeight,
  CapUIIcon,
  Text,
} from '@cap-collectif/ui'
import type { ProposalPreviewCard_proposal$key } from '~relay/ProposalPreviewCard_proposal.graphql'
import type { ProposalPreviewCard_viewer$key } from '~relay/ProposalPreviewCard_viewer.graphql'
import type { ProposalPreviewCard_step$key } from '~relay/ProposalPreviewCard_step.graphql'
import CategoryBackground from '~/components/Ui/Medias/CategoryBackground'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import convertIconToDs from '@shared/utils/convertIconToDs'
import { getBaseUrlFromProposalUrl } from '~/utils/router'
import { Link, ACTIVE_COLOR, VoteStepEvent, dispatchEvent, cardWidthListView, cardWidthMapView } from '../utils'
import stripHtml from '@shared/utils/stripHTML'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

import ProposalPreviewCardFooter from './ProposalPreviewCardFooter'

const FRAGMENT = graphql`
  fragment ProposalPreviewCard_proposal on Proposal
  @argumentDefinitions(stepId: { type: "ID!" }, isAuthenticated: { type: "Boolean!" }) {
    id
    title
    url
    slug
    summary
    body
    author {
      displayName
      media {
        url
      }
    }
    category {
      name
      color
      icon
    }
    theme {
      title
    }
    district {
      name
    }
    media {
      url
      name
    }
    status(step: $stepId) {
      name
    }
    currentVotableStep {
      id
    }
    ...ProposalPreviewCardFooter_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
    viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
  }
`
const FRAGMENT_STEP = graphql`
  fragment ProposalPreviewCard_step on Step
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, token: { type: "String" }) {
    ...ProposalPreviewCardFooter_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
    ... on ProposalStep {
      viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
        edges {
          node {
            id
            proposal {
              id
            }
          }
        }
      }
    }
  }
`

const FRAGMENT_VIEWER = graphql`
  fragment ProposalPreviewCard_viewer on User @argumentDefinitions(stepId: { type: "ID!" }) {
    ...ProposalPreviewCardFooter_viewer @arguments(stepId: $stepId)
  }
`

export const Card = ({
  children,
  fullSize,
  ...rest
}: AppBoxProps & {
  children: JSX.Element | JSX.Element[] | string
  fullSize: boolean
}) => {
  return (
    <DsCard
      bg="white"
      p={6}
      mb={[6, 4]}
      justify="center"
      alignItems="center"
      borderRadius="accordion"
      border="none"
      minHeight="unset"
      width={fullSize ? cardWidthListView : cardWidthMapView}
      {...rest}
    >
      {children}
    </DsCard>
  )
}

export const ImageContainer = ({ children }: { children: React.ReactNode }) => (
  <Flex justify="center">
    <Box height="200px" width="300px" overflow="hidden" borderRadius="normal" position="relative">
      {children}
    </Box>
  </Flex>
)

export const ProposalPreviewCard = ({
  proposal: proposalFragment,
  viewer: viewerFragment,
  step: stepFragment,
  showImage,
  isHighlighted,
  stepId,
  disabled,
  fullSize,
}: {
  proposal: ProposalPreviewCard_proposal$key | null | undefined
  viewer: ProposalPreviewCard_viewer$key | null | undefined
  step: ProposalPreviewCard_step$key | null | undefined
  showImage?: boolean
  isHighlighted?: boolean
  stepId: string
  disabled: boolean
  fullSize: boolean
}) => {
  const intl = useIntl()
  const proposal = useFragment(FRAGMENT, proposalFragment)
  const viewer = useFragment(FRAGMENT_VIEWER, viewerFragment)
  const step = useFragment(FRAGMENT_STEP, stepFragment)
  const isCompleteView = useFeatureFlag('full_proposal_card')

  const { projectSlug } = useParams<{ projectSlug?: string }>()
  if (!proposal || !step) return null

  const { media, author, category, title, summary, body, status, district, theme, currentVotableStep } = proposal

  const { viewerVotes } = step

  const url = getBaseUrlFromProposalUrl(proposal.url as string)
  const summaryOrBodyExcerpt = stripHtml((summary ?? body ?? '') as string) || ''

  const TRUNCATE = 285

  const hasVoted =
    viewer && proposal?.viewerHasVote
      ? proposal.viewerHasVote
      : viewerVotes?.edges?.some(edge => edge?.node?.proposal?.id === proposal.id) ?? false

  return (
    <Proposal
      width={fullSize ? cardWidthListView : cardWidthMapView}
      mb={[6, 4]}
      id={`proposal-${proposal.id}`}
      className={hasVoted ? 'voted' : ''}
      onMouseEnter={() =>
        dispatchEvent(VoteStepEvent.HoverCardStart, {
          id: proposal.id,
        })
      }
      onMouseLeave={() => dispatchEvent(VoteStepEvent.HoverCardEnd)}
      sx={{
        '*': {
          textDecoration: 'none !important',
        },
      }}
      boxShadow={['small', isHighlighted ? '0 10px 30px rgba(0, 0, 0, 0.15)' : 'unset']}
    >
      <Proposal.Content width={['100%', isCompleteView ? '100%' : 'unset']}>
        <Proposal.Content.Header>
          <Flex spacing={isCompleteView ? 2 : 0} flexWrap="wrap">
            {isCompleteView && !!status ? (
              // @ts-ignore fix DS
              <Tag variantColor="neutral-gray" sx={{ maxWidth: 'unset !important' }}>
                {status?.name}
              </Tag>
            ) : null}
            {!isCompleteView ? <Proposal.Content.Header.Author author={author.displayName} /> : null}
            {isCompleteView ? (
              <>
                {district ? <Proposal.Content.Header.Author author={district.name} icon={CapUIIcon.PinO} /> : null}
                {theme ? (
                  <Text color="neutral-gray.800" fontSize={2}>
                    {theme.title}
                  </Text>
                ) : null}
              </>
            ) : null}
          </Flex>
          <Link
            href={`${projectSlug || ''}/${url}/${proposal.slug}`}
            stepId={stepId}
            currentVotableStepId={currentVotableStep?.id || stepId}
          >
            <Heading as="h4" fontSize="16px" color="neutral-gray.900" fontWeight={CapUIFontWeight.Bold}>
              {title}
            </Heading>
          </Link>
        </Proposal.Content.Header>
        <Link
          href={`${projectSlug || ''}/${url}/${proposal.slug}`}
          stepId={stepId}
          currentVotableStepId={currentVotableStep?.id || stepId}
        >
          <Proposal.Content.Body fontSize="14px">
            <>
              {summaryOrBodyExcerpt.slice(0, TRUNCATE)}
              {summaryOrBodyExcerpt.length > TRUNCATE ? (
                <>
                  {'... '}
                  <span style={{ textDecoration: 'underline' }}>
                    {intl.formatMessage({
                      id: 'capco.module.read_more',
                    })}
                  </span>
                </>
              ) : null}
            </>
          </Proposal.Content.Body>
        </Link>
        <Flex justifyContent="space-between" alignItems="center" direction={['column', 'row']}>
          <ProposalPreviewCardFooter
            disabled={disabled}
            proposal={proposal}
            viewer={viewer}
            step={step}
            stepId={stepId}
          />
          {isCompleteView ? <Proposal.Content.Header.Author author={author.displayName} mt={4} /> : null}
        </Flex>
      </Proposal.Content>
      {showImage ? (
        <Link
          href={`${projectSlug || ''}/${url}/${proposal.slug}`}
          stepId={stepId}
          currentVotableStepId={currentVotableStep?.id || stepId}
        >
          {media ? (
            <Box sx={{ '.cap-tag': { maxWidth: 'unset !important' } }}>
              <Proposal.Cover
                src={media.url as string}
                alt={media.name}
                status={!isCompleteView ? status?.name : null}
              />
            </Box>
          ) : (
            <ImageContainer>
              {!!status && !isCompleteView && (
                <Tag
                  // @ts-ignore !important
                  sx={{ position: 'absolute !important', maxWidth: 'unset !important' }}
                  top={2}
                  right={2}
                  zIndex={2}
                  variantColor="neutral-gray"
                >
                  {status?.name}
                </Tag>
              )}
              {category?.icon ? (
                <Box position="absolute" left="calc(50% - 1.4rem)" top="calc(50% - 1.4rem)" zIndex={1}>
                  <Icon name={convertIconToDs(category?.icon)} size={CapUIIconSize.Xl} color="white" />
                </Box>
              ) : null}
              <CategoryBackground color={category?.color || ACTIVE_COLOR} viewBox="5 0 240 80" height="200px" />
            </ImageContainer>
          )}
        </Link>
      ) : null}
    </Proposal>
  )
}
export default ProposalPreviewCard
