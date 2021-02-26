// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button } from 'react-bootstrap';
import ProposalPreviewVote from './ProposalPreviewVote';
import ProposalDetailEstimation from '../Detail/ProposalDetailEstimation';
import ProposalDetailLikers from '../Detail/ProposalDetailLikers';
import ProposalVoteThresholdProgressBar from '../Vote/ProposalVoteThresholdProgressBar';
import Tag from '../../Ui/Labels/Tag';
import TagsList from '../../Ui/List/TagsList';
import type { State, FeatureToggles } from '~/types';
import ProposalFollowButton from '../Follow/ProposalFollowButton';
import type { ProposalPreviewBody_proposal } from '~relay/ProposalPreviewBody_proposal.graphql';
import type { ProposalPreviewBody_step } from '~relay/ProposalPreviewBody_step.graphql';
import type { ProposalPreviewBody_viewer } from '~relay/ProposalPreviewBody_viewer.graphql';
import Card from '../../Ui/Card/Card';
import ProposalPreviewUser from './ProposalPreviewUser';
import { translateContent } from '~/utils/ContentTranslator';

type Props = {
  proposal: ProposalPreviewBody_proposal,
  features: FeatureToggles,
  step: ?ProposalPreviewBody_step,
  viewer: ?ProposalPreviewBody_viewer,
};

export class ProposalPreviewBody extends React.Component<Props> {
  render() {
    const { proposal, features, step, viewer } = this.props;

    // $FlowFixMe summaryOrBodyExcerpt not typed.
    const summary = translateContent(proposal.summaryOrBodyExcerpt);

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
              <p className="excerpt small">{summary}</p>
            </React.Fragment>
          )}
          <TagsList>
            {features.themes && showThemes && proposal.theme && (
              <Tag icon="cap cap-tag-1-1 icon--blue">{proposal.theme.title}</Tag>
            )}
            {proposal.category && (
              <Tag icon="cap cap-tag-1-1 icon--blue">{proposal.category.name}</Tag>
            )}
            {features.districts && proposal.district && (
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
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(ProposalPreviewBody);

export default createFragmentContainer(container, {
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
      voteType
      project {
        opinionCanBeFollowed
      }
    }
  `,
});
