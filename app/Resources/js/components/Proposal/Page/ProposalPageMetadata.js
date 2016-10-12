import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ProposalDetailEstimation from '../Detail/ProposalDetailEstimation';
import ProposalDetailLikers from '../Detail/ProposalDetailLikers';
import Truncate from 'react-truncate';

const ProposalPageMetadata = React.createClass({
  displayName: 'ProposalPageMetadata',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    showDistricts: PropTypes.bool.isRequired,
    showCategories: PropTypes.bool.isRequired,
    showNullEstimation: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { proposal, showCategories, showDistricts, showNullEstimation } = this.props;
    return (
        <div>
          { ((showCategories && proposal.category) || (showDistricts && proposal.district))
          && <div className="proposal__page__metadata">
            <div className="proposal__infos">
              {
                showCategories && proposal.category
                && <div className="proposal__info proposal__info--category">
                  <i className="cap cap-tag-1-1 icon--blue"></i><Truncate>{proposal.category.name}</Truncate>
                </div>
              }
              {
                showDistricts && proposal.district
                && <div className="proposal__info proposal__info--district">
                  <i className="cap cap-marker-1-1 icon--blue"></i><Truncate>{proposal.district.name}</Truncate>
                </div>
              }
              <ProposalDetailEstimation
                  proposal={proposal}
                  showNullEstimation={showNullEstimation}
              />
              <ProposalDetailLikers
                  proposal={proposal}
                  componentClass="div"
              />
            </div>
          </div>
          }
        </div>
    );
  },

});

export default ProposalPageMetadata;
