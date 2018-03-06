import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import ProposalDetailEstimation from '../Detail/ProposalDetailEstimation';
import ProposalDetailLikers from '../Detail/ProposalDetailLikers';

const ProposalPreviewBody = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    showNullEstimation: PropTypes.bool.isRequired,
    showThemes: PropTypes.bool.isRequired,
    features: PropTypes.object.isRequired,
  },

  render() {
    const { proposal, showThemes, showNullEstimation, features } = this.props;

    return (
      <div className="card__body">
        <div className="card__body__infos">
          <a href={proposal.show_url ? proposal.show_url : proposal._links.show}>
            <h2 className="card__title">
              <Truncate lines={3}>{proposal.title}</Truncate>
            </h2>
          </a>
          <div className="excerpt small">{proposal.summaryOrBodyExcerpt}</div>
          <div className="card__tags">
            {features.themes &&
            showThemes &&
            proposal.theme && (
              <div className="card__tag ellipsis">
                <i className="cap cap-tag-1-1 icon--blue" />
                {proposal.theme.title}
              </div>
            )}
            {proposal.category && (
              <div className="card__tag ellipsis">
                <i className="cap cap-tag-1-1 icon--blue" />
                {proposal.category.name}
              </div>
            )}
            {features.districts &&
            proposal.district && (
              <div className="card__tag ellipsis">
                <i className="cap cap-marker-1-1 icon--blue" />
                {proposal.district.name}
              </div>
            )}
            <ProposalDetailEstimation proposal={proposal} showNullEstimation={showNullEstimation} />
            <ProposalDetailLikers proposal={proposal} />
        </div>

        </div>
      </div>
    );
  },
});

const mapStateToProps = state => {
  return { features: state.default.features };
};

export default connect(mapStateToProps)(ProposalPreviewBody);
