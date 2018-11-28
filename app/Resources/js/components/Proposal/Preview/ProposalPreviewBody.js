// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import Truncate from 'react-truncate';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalPreviewVote from './ProposalPreviewVote';
import ProposalDetailEstimation from '../Detail/ProposalDetailEstimation';
import ProposalDetailLikers from '../Detail/ProposalDetailLikers';
import ProposalVoteThresholdProgressBar from '../Vote/ProposalVoteThresholdProgressBar';
import TagsList from '../../Ui/List/TagsList';
import type { State, FeatureToggles } from '../../../types';
import ProposalFollowButton from '../Follow/ProposalFollowButton';
import type { ProposalPreviewBody_proposal } from './__generated__/ProposalPreviewBody_proposal.graphql';
import type { ProposalPreviewBody_step } from './__generated__/ProposalPreviewBody_step.graphql';
import type { ProposalPreviewBody_viewer } from './__generated__/ProposalPreviewBody_viewer.graphql';

type Props = {
  proposal: ProposalPreviewBody_proposal,
  features: FeatureToggles,
  step: ?ProposalPreviewBody_step,
  viewer: ?ProposalPreviewBody_viewer,
};

export class ProposalPreviewBody extends React.Component<Props> {
  render() {
    const { proposal, features, step, viewer } = this.props;

    const showThemes = true;
    return (
      <div className="card__body">
        <div className="card__body__infos">
          {proposal.trashed && proposal.trashedStatus === 'INVISIBLE' ? (
            <h4>
              <FormattedMessage id="proposal.show.trashed.contentDeleted" />
            </h4>
          ) : (
            <React.Fragment>
              <a href={proposal.show_url}>
                <h2 className="card__title">
                  <Truncate lines={3}>{proposal.title}</Truncate>
                </h2>
              </a>
              <div className="excerpt small">{proposal.summaryOrBodyExcerpt}</div>
            </React.Fragment>
          )}
          <TagsList>
            {features.themes &&
              showThemes &&
              proposal.theme && (
                <div className="tags-list__tag">
                  <i className="cap cap-tag-1-1 icon--blue" />
                  {proposal.theme.title}
                </div>
              )}
            {proposal.category && (
              <div className="tags-list__tag">
                <i className="cap cap-tag-1-1 icon--blue" />
                {proposal.category.name}
              </div>
            )}
            {features.districts &&
              proposal.district && (
                <div className="tags-list__tag">
                  <i className="cap cap-marker-1-1 icon--blue" />
                  {proposal.district.name}
                </div>
              )}
            {/* $FlowFixMe */}
            <ProposalDetailEstimation
              showNullEstimation={step && step.voteType === 'BUDGET'}
              proposal={proposal}
            />
            {/* $FlowFixMe */}
            <ProposalDetailLikers proposal={proposal} />
          </TagsList>
        </div>
        <div className="proposal__buttons">
          {/* $FlowFixMe */
          step &&
            proposal.currentVotableStep &&
            step.id === proposal.currentVotableStep.id && (
              /* $FlowFixMe */
              <ProposalPreviewVote step={step} viewer={viewer} proposal={proposal} />
            )}
          {/* $FlowFixMe */}
          <ProposalFollowButton proposal={proposal} />
        </div>
        {step &&
          step.voteThreshold !== null &&
          typeof step.voteThreshold !== 'undefined' &&
          step.voteThreshold > 0 && (
            <div style={{ marginTop: '20px' }}>
              {/* $FlowFixMe */}
              <ProposalVoteThresholdProgressBar proposal={proposal} step={step} />
            </div>
          )}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  features: state.default.features,
});

const container = connect(mapStateToProps)(ProposalPreviewBody);

export default createFragmentContainer(container, {
  viewer: graphql`
    fragment ProposalPreviewBody_viewer on User {
      ...ProposalPreviewVote_viewer
    }
  `,
  proposal: graphql`
    fragment ProposalPreviewBody_proposal on Proposal
      @argumentDefinitions(
        isAuthenticated: { type: "Boolean", defaultValue: true }
        isProfileView: { type: "Boolean", defaultValue: false }
      ) {
      id
      title
      trashed
      trashedStatus
      show_url
      summaryOrBodyExcerpt
      district {
        name
      }
      theme {
        title
      }
      category {
        name
      }
      ...ProposalPreviewVote_proposal
        @arguments(isAuthenticated: $isAuthenticated)
        @skip(if: $isProfileView)
      ...ProposalDetailEstimation_proposal
      ...ProposalDetailLikers_proposal
      ...ProposalVoteThresholdProgressBar_proposal @skip(if: $isProfileView)
      currentVotableStep @skip(if: $isProfileView) {
        id
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
    }
  `,
});
