import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import Truncate from 'react-truncate';
import ProposalDetailEstimation from '../Detail/ProposalDetailEstimation';
import ProposalPreviewVote from './ProposalPreviewVote';
import ProposalDetailLikers from '../Detail/ProposalDetailLikers';
import ProposalVoteThresholdProgressBar from '../Vote/ProposalVoteThresholdProgressBar';
import TagsList from '../../Ui/List/TagsList';
import { type State } from '../../../types';

type Props = {
  proposal: Object,
  showNullEstimation: boolean,
  showThemes: boolean,
  features: Object,
  step: Object,
};

export class ProposalPreviewBody extends React.Component<Props> {
  render() {
    const { proposal, showThemes, showNullEstimation, features, step } = this.props;

    return (
      <div className="card__body">
        <div className="card__body__infos">
          <a href={proposal.show_url ? proposal.show_url : proposal._links.show}>
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
        {step.id === proposal.votableStepId && <ProposalPreviewVote proposal={proposal} />}
        {step.voteThreshold > 0 && (
          <ProposalVoteThresholdProgressBar proposal={proposal} step={step} />
        )}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  return {
    features: state.default.features,
  };
};

export default connect(mapStateToProps)(ProposalPreviewBody);
