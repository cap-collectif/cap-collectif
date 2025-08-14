import * as React from 'react'
import Truncate from 'react-truncate'
import { FormattedMessage, useIntl } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import { Link, useParams } from 'react-router-dom'
import { Flex } from '@cap-collectif/ui'
import ProposalPreviewVote from './ProposalPreviewVote'
import { getBaseUrl } from '~/config'
import ProposalDetailEstimation from '../Detail/ProposalDetailEstimation'
import ProposalDetailLikers from '../Detail/ProposalDetailLikers'
import ProposalVoteThresholdProgressBar from '../Vote/ProposalVoteThresholdProgressBar'
import Tag from '../../Ui/Labels/Tag'
import TagsList from '../../Ui/List/TagsList'
import ProposalFollowButton from '../Follow/ProposalFollowButton'
import type { ProposalPreviewBody_proposal } from '~relay/ProposalPreviewBody_proposal.graphql'
import type { ProposalPreviewBody_step } from '~relay/ProposalPreviewBody_step.graphql'
import type { ProposalPreviewBody_viewer } from '~relay/ProposalPreviewBody_viewer.graphql'
import Card from '../../Ui/Card/Card'
import ProposalPreviewUser from './ProposalPreviewUser'
import { translateContent, isPredefinedTraductionKey } from '@shared/utils/contentTranslator'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { getBaseUrlFromProposalUrl } from '~/utils/router'

type Props = {
  proposal: ProposalPreviewBody_proposal
  step: ProposalPreviewBody_step | null | undefined
  viewer: ProposalPreviewBody_viewer | null | undefined
  participant: ProposalPreviewBody_participant | null | undefined
  isSPA?: boolean
}

const Route = ({
  proposal,
  step,
}: {
  proposal: ProposalPreviewBody_proposal
  step: ProposalPreviewBody_step | null | undefined
}) => {
  const { projectSlug } = useParams()
  const url = getBaseUrlFromProposalUrl(proposal.url)
  return (
    <Link
      to={{
        pathname: `/project/${projectSlug || ''}/${url}/${proposal.slug}`,
        state: {
          currentVotableStepId: proposal.currentVotableStep?.id,
          stepUrl: step?.url.replace(getBaseUrl(), ''),
          stepId: step?.id,
        },
      }}
    >
      <Card.Title tagName="h4">
        <Truncate lines={3}>{translateContent(proposal.title)}</Truncate>
      </Card.Title>
    </Link>
  )
}

const renderProposalTitle = (
  proposal: ProposalPreviewBody_proposal,
  step: ProposalPreviewBody_step | null | undefined,
  isSPA?: boolean,
) => {
  return isSPA ? (
    <Route proposal={proposal} step={step} />
  ) : (
    <a href={proposal.url}>
      <Card.Title tagName="h4">
        <Truncate lines={3}>{translateContent(proposal.title)}</Truncate>
      </Card.Title>
    </a>
  )
}

export const ProposalPreviewBody = ({ proposal, step, viewer, participant, isSPA }: Props) => {
  const intl = useIntl()
  const summary =
    proposal.summaryOrBodyExcerpt && isPredefinedTraductionKey(proposal.summaryOrBodyExcerpt)
      ? intl.formatMessage({
          id: proposal.summaryOrBodyExcerpt,
        })
      : proposal.summaryOrBodyExcerpt
  const showThemes = true
  return (
    <Card.Body>
      <div className="flex-1">
        <ProposalPreviewUser proposal={proposal} />
        <hr />
        {proposal.trashed && proposal.trashedStatus === 'INVISIBLE' ? (
          <h4>
            <FormattedMessage id="proposal.show.trashed.contentDeleted" />
          </h4>
        ) : (
          <React.Fragment>
            {renderProposalTitle(proposal, step, isSPA)}
            <p className="excerpt small">
              <WYSIWYGRender value={summary} />
            </p>
          </React.Fragment>
        )}
        <TagsList>
          {useFeatureFlag('themes') && showThemes && proposal.theme && (
            <Tag icon="cap cap-tag-1-1 icon--blue">{proposal.theme.title}</Tag>
          )}
          {proposal.category && <Tag icon="cap cap-tag-1-1 icon--blue">{proposal.category.name}</Tag>}
          {useFeatureFlag('districts') && proposal.district && (
            <Tag icon="cap cap-marker-1-1 icon--blue">{proposal.district.name}</Tag>
          )}
          {step && (
            <ProposalDetailEstimation showNullEstimation={step && step.voteType === 'BUDGET'} proposal={proposal} />
          )}

          <ProposalDetailLikers proposal={proposal} />
        </TagsList>
      </div>
      <Flex className="proposal__buttons mt-15">
        {step &&
          proposal.currentVotableStep &&
          step.id === proposal.currentVotableStep.id &&
          !proposal.isArchived && <ProposalPreviewVote step={step} viewer={viewer} proposal={proposal} participant={participant} />}
        {step && step.project && step.project.opinionCanBeFollowed ? (
          <ProposalFollowButton proposal={proposal} isAuthenticated={!!viewer} />
        ) : null}
      </Flex>
      {step &&
        step.canDisplayBallot &&
        step.voteThreshold !== null &&
        typeof step.voteThreshold !== 'undefined' &&
        step.voteThreshold > 0 && (
          <div
            style={{
              marginTop: '20px',
            }}
          >
            <ProposalVoteThresholdProgressBar
              proposal={proposal}
              step={step}
              showPoints={(proposal.currentVotableStep && proposal.currentVotableStep.votesRanking) || false}
            />
          </div>
        )}
    </Card.Body>
  )
}
export default createFragmentContainer(ProposalPreviewBody, {
  viewer: graphql`
    fragment ProposalPreviewBody_viewer on User @argumentDefinitions(stepId: { type: "ID!" }) {
      ...ProposalPreviewVote_viewer @arguments(stepId: $stepId)
    }
  `,
  participant: graphql`
    fragment ProposalPreviewBody_participant on Participant @argumentDefinitions(stepId: { type: "ID!" }) {
      ...ProposalPreviewVote_participant @arguments(stepId: $stepId)
    }
  `,
  proposal: graphql`
    fragment ProposalPreviewBody_proposal on Proposal
    @argumentDefinitions(
      isAuthenticated: { type: "Boolean!" }
      isProfileView: { type: "Boolean", defaultValue: false }
      stepId: { type: "ID!" }
      token: {type: "String"}
    ) {
      isArchived
      id
      slug
      currentVotableStep {
        id
      }
      title
      trashed
      trashedStatus
      url
      summaryOrBodyExcerpt
      form {
        objectType
      }
      media {
        url
        name
      }
      district {
        name
      }
      theme {
        title
      }
      category {
        name
      }
      ...ProposalPreviewUser_proposal
      ...ProposalPreviewVote_proposal
        @arguments(isAuthenticated: $isAuthenticated, stepId: $stepId, token: $token)
        @skip(if: $isProfileView)
      ...ProposalDetailEstimation_proposal
      ...ProposalDetailLikers_proposal
      ...ProposalVoteThresholdProgressBar_proposal @skip(if: $isProfileView)
      currentVotableStep @skip(if: $isProfileView) {
        id
        votesRanking
      }
      ...ProposalFollowButton_proposal @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
  step: graphql`
    fragment ProposalPreviewBody_step on ProposalStep {
      id
      ...ProposalPreviewVote_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
      ...ProposalVoteThresholdProgressBar_step
      voteThreshold
      url
      canDisplayBallot
      voteType
      project {
        opinionCanBeFollowed
      }
    }
  `,
})
