// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import Truncate from 'react-truncate';
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
  step: ProposalPreviewBody_step,
  viewer: ProposalPreviewBody_viewer,
};

export class ProposalPreviewBody extends React.Component<Props> {
  render() {
    const { proposal, features, step, viewer } = this.props;

    const showThemes = true;
    return (
      <div className="card__body">
        <div className="card__body__infos">
          <a href={proposal.show_url}>
            <h2 className="card__title">
              <Truncate lines={3}>{proposal.title}</Truncate>
            </h2>
          </a>
          <div className="excerpt small">{proposal.summaryOrBodyExcerpt}</div>
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
            <ProposalDetailEstimation proposal={proposal} />
            {/* $FlowFixMe */}
            <ProposalDetailLikers proposal={proposal} />
          </TagsList>
        </div>
        <div className="proposal__buttons">
          {
            /* $FlowFixMe */
            proposal.currentVotableStep && step.id === proposal.currentVotableStep.id && <ProposalPreviewVote step={step} viewer={viewer} proposal={proposal} />
          }
          {/* $FlowFixMe */}
          <ProposalFollowButton proposal={proposal} />
        </div>
        {step.voteThreshold !== null && typeof step.voteThreshold !== "undefined" && step.voteThreshold > 0 && (
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

export default createFragmentContainer(
  container,
  {
    viewer: graphql`
      fragment ProposalPreviewBody_viewer on User {
        ...ProposalPreviewVote_viewer
      }
    `,
    proposal: graphql`
      fragment ProposalPreviewBody_proposal on Proposal {
        id
        title
        show_url
        summaryOrBodyExcerpt
        commentsCount
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
        ...ProposalDetailEstimation_proposal
        ...ProposalDetailLikers_proposal
        ...ProposalVoteThresholdProgressBar_proposal
        currentVotableStep {
          id
        }
        ...ProposalFollowButton_proposal @arguments(isAuthenticated: $isAuthenticated)
      }
    `,
    step: graphql`
      fragment ProposalPreviewBody_step on Step {
        id
        ...ProposalPreviewVote_step
        ...ProposalVoteThresholdProgressBar_step
        ... on CollectStep {
          voteThreshold
        }
        ... on SelectionStep {
          voteThreshold
        }
      }
    `,
  }
);
