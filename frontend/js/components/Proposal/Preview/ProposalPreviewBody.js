// @flow
import * as React from 'react';
import Truncate from 'react-truncate';
import { FormattedMessage, useIntl } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button } from 'react-bootstrap';
import ProposalPreviewVote from './ProposalPreviewVote';
import ProposalDetailEstimation from '../Detail/ProposalDetailEstimation';
import ProposalDetailLikers from '../Detail/ProposalDetailLikers';
import ProposalVoteThresholdProgressBar from '../Vote/ProposalVoteThresholdProgressBar';
import Tag from '../../Ui/Labels/Tag';
import TagsList from '../../Ui/List/TagsList';
import ProposalFollowButton from '../Follow/ProposalFollowButton';
import type { ProposalPreviewBody_proposal } from '~relay/ProposalPreviewBody_proposal.graphql';
import type { ProposalPreviewBody_step } from '~relay/ProposalPreviewBody_step.graphql';
import type { ProposalPreviewBody_viewer } from '~relay/ProposalPreviewBody_viewer.graphql';
import Card from '../../Ui/Card/Card';
import ProposalPreviewUser from './ProposalPreviewUser';
import { translateContent, isPredefinedTraductionKey } from '~/utils/ContentTranslator';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

type Props = {
  proposal: ProposalPreviewBody_proposal,
  step: ?ProposalPreviewBody_step,
  viewer: ?ProposalPreviewBody_viewer,
};

export const ProposalPreviewBody = ({ proposal, step, viewer }: Props) => {
  const intl = useIntl();
  const summary =
    proposal.summaryOrBodyExcerpt && isPredefinedTraductionKey(proposal.summaryOrBodyExcerpt)
      ? intl.formatMessage({ id: proposal.summaryOrBodyExcerpt })
      : proposal.summaryOrBodyExcerpt;
  const showThemes = true;
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
            <a href={proposal.url}>
              <Card.Title tagName="h4">
                <Truncate lines={3}>{translateContent(proposal.title)}</Truncate>
              </Card.Title>
            </a>
            <p className="excerpt small">
              <WYSIWYGRender value={summary} />
            </p>
          </React.Fragment>
        )}
        <TagsList>
          {useFeatureFlag('themes') && showThemes && proposal.theme && (
            <Tag icon="cap cap-tag-1-1 icon--blue">{proposal.theme.title}</Tag>
          )}
          {proposal.category && (
            <Tag icon="cap cap-tag-1-1 icon--blue">{proposal.category.name}</Tag>
          )}
          {useFeatureFlag('districts') && proposal.district && (
            <Tag icon="cap cap-marker-1-1 icon--blue">{proposal.district.name}</Tag>
          )}
          {step && (
            <ProposalDetailEstimation
              showNullEstimation={step && step.voteType === 'BUDGET'}
              proposal={proposal}
            />
          )}

          <ProposalDetailLikers proposal={proposal} />
        </TagsList>
      </div>
      <div className="proposal__buttons mt-15">
        {step &&
          proposal.currentVotableStep &&
          step.id === proposal.currentVotableStep.id &&
          proposal.form.objectType !== 'ESTABLISHMENT' && (
            <ProposalPreviewVote step={step} viewer={viewer} proposal={proposal} />
          )}
        {step &&
        step.project &&
        step.project.opinionCanBeFollowed &&
        proposal.form.objectType !== 'ESTABLISHMENT' ? (
          <ProposalFollowButton proposal={proposal} isAuthenticated={!!viewer} />
        ) : null}
        {proposal.form.objectType === 'ESTABLISHMENT' && (
          <Button
            href={proposal.url}
            className="btn btn-default proposal__establishment"
            id="proposal-support-btn-placeholder">
            <FormattedMessage id="support" />
          </Button>
        )}
      </div>
      {step &&
        step.canDisplayBallot &&
        step.voteThreshold !== null &&
        typeof step.voteThreshold !== 'undefined' &&
        step.voteThreshold > 0 && (
          <div style={{ marginTop: '20px' }}>
            <ProposalVoteThresholdProgressBar
              proposal={proposal}
              step={step}
              showPoints={
                (proposal.currentVotableStep && proposal.currentVotableStep.votesRanking) || false
              }
            />
          </div>
        )}
    </Card.Body>
  );
};

export default createFragmentContainer(ProposalPreviewBody, {
  viewer: graphql`
    fragment ProposalPreviewBody_viewer on User {
      ...ProposalPreviewVote_viewer
    }
  `,
  proposal: graphql`
    fragment ProposalPreviewBody_proposal on Proposal
    @argumentDefinitions(
      isAuthenticated: { type: "Boolean!" }
      isProfileView: { type: "Boolean", defaultValue: false }
    ) {
      id
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
        @arguments(isAuthenticated: $isAuthenticated)
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
      ...ProposalPreviewVote_step @arguments(isAuthenticated: $isAuthenticated)
      ...ProposalVoteThresholdProgressBar_step
      voteThreshold
      canDisplayBallot
      voteType
      project {
        opinionCanBeFollowed
      }
    }
  `,
});
