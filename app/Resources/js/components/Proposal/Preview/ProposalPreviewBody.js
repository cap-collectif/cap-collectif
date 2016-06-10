import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ProposalDetailEstimation from '../Detail/ProposalDetailEstimation';
import ProposalDetailLikers from '../Detail/ProposalDetailLikers';
import { connect } from 'react-redux';

const ProposalPreviewBody = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    showNullEstimation: PropTypes.bool.isRequired,
    showThemes: PropTypes.bool.isRequired,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { proposal, showThemes, showNullEstimation, features } = this.props;

    return (
      <div className="proposal__body" >
        <h2 className="h4 proposal__title smart-fade">
          <a href={proposal._links.show}>{proposal.title}</a>
        </h2>
        <div className="proposal__infos">
          {
            features.themes && showThemes && proposal.theme
            && <div className="proposal__info">
                <i className="cap cap-tag-1-1"></i>{proposal.theme.title}
              </div>
          }
          {
            proposal.category
            && <div className="proposal__info">
              <i className="cap cap-tag-1-1"></i>{proposal.category.name}
            </div>
          }
          {
            features.districts && proposal.district
            && <div className="proposal__info">
              <i className="cap cap-marker-1-1"></i>{proposal.district.name}
            </div>
          }
          <ProposalDetailEstimation
            proposal={proposal}
            showNullEstimation={showNullEstimation}
          />
          <ProposalDetailLikers
            proposal={proposal}
          />
        </div>
      </div>
    );
  },

});


const mapStateToProps = (state) => {
  return { features: state.features };
};

export default connect(mapStateToProps, null, null, { pure: false })(ProposalPreviewBody);
