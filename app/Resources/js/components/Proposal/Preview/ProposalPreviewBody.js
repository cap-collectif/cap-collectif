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
      <div className="proposal__body">
        <a href={proposal._links.show}>
          <h2 className="h4 proposal__title">
            <Truncate lines={3}>{proposal.title}</Truncate>
          </h2>
        </a>
        <div className="excerpt">{proposal.summaryOrBodyExcerpt}</div>
        <div className="proposal__infos">
          {features.themes &&
          showThemes &&
          proposal.theme && (
            <div className="proposal__info ellipsis">
              <i className="cap cap-tag-1-1 icon--blue" />
              {proposal.theme.title}
            </div>
          )}
          {proposal.category && (
            <div className="proposal__info ellipsis">
              <i className="cap cap-tag-1-1 icon--blue" />
              {proposal.category.name}
            </div>
          )}
          {features.districts &&
          proposal.district && (
            <div className="proposal__info ellipsis">
              <i className="cap cap-marker-1-1 icon--blue" />
              {proposal.district.name}
            </div>
          )}
          <ProposalDetailEstimation proposal={proposal} showNullEstimation={showNullEstimation} />
          <ProposalDetailLikers proposal={proposal} />
        </div>
      </div>
    );
  },
});

const mapStateToProps = state => {
  return { features: state.default.features };
};

export default connect(mapStateToProps)(ProposalPreviewBody);
