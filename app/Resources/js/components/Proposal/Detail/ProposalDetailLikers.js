import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ProposalDetailLikersLabel from './ProposalDetailLikersLabel';
import ProposalDetailLikersTooltipLabel from './ProposalDetailLikersTooltipLabel';

const ProposalDetailLikers = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { proposal } = this.props;
    if (proposal.likers.length > 0) {
      return (
        <span className="proposal__info">
          <OverlayTrigger placement="top" overlay={
            <Tooltip id={'proposal-' + proposal.id + '-likers-tooltip-'}>
              <ProposalDetailLikersTooltipLabel likers={proposal.likers} />
            </Tooltip>
          }>
            <ProposalDetailLikersLabel likers={proposal.likers} />
          </OverlayTrigger>
        </span>
      );
    }

    return null;
  },
});

export default ProposalDetailLikers;
