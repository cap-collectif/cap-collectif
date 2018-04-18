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
import { type State } from '../../../types';
import ProposalFollowButton from '../Follow/ProposalFollowButton';

type Props = {
  proposal: Object,
  features: Object,
  step: Object,
};

export class ProposalPreviewBody extends React.Component<Props> {
  render() {
    const { proposal, features, step } = this.props;

    const showThemes = true;
    const showNullEstimation = true;
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
            <ProposalDetailEstimation proposal={proposal} showNullEstimation={showNullEstimation} />
            <ProposalDetailLikers proposal={proposal} />
          </TagsList>
        </div>
        <div className="proposal__buttons">
          {
            step.id === proposal.votableStepId && <ProposalPreviewVote proposal={proposal} />
          }
          <ProposalFollowButton proposal={proposal} />
        </div>
        {step.voteThreshold > 0 && (
          <div style={{ marginTop: '20px' }}>
            <ProposalVoteThresholdProgressBar proposal={proposal} step={step} />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  return {
    features: state.default.features,
    // isAuthenticated: state.user.user !== null,
  };
};

const container = connect(mapStateToProps)(ProposalPreviewBody);

export default createFragmentContainer(
  container,
  {
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
        ...ProposalDetailEstimation_proposal
        #votableStepId
        #...ProposalFollowButton_proposal @arguments(isAuthenticated: $isAuthenticated)
      }
    `,
    step: graphql`
      fragment ProposalPreviewBody_step on Step {
        ... on CollectStep {
          id
          voteThreshold
        }
        ... on SelectionStep {
          id
          voteThreshold
        }
      }
    `,
  }
);
