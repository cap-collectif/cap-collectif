import React, { PropTypes } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ProposalDetailLikersLabel from './ProposalDetailLikersLabel';
import ProposalDetailLikersTooltipLabel from './ProposalDetailLikersTooltipLabel';

const ProposalDetailLikers = React.createClass({
  displayName: 'ProposalDetailLikers',

  propTypes: {
    proposal: PropTypes.object.isRequired,
    componentClass: PropTypes.oneOf(['div', 'span']),
  },

  getDefaultProps() {
    return {
      componentClass: 'span',
    };
  },

  renderContent() {
    const { proposal } = this.props;
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`proposal-${proposal.id}-likers-tooltip-`}>
            <ProposalDetailLikersTooltipLabel likers={proposal.likers} />
          </Tooltip>
        }>
        <ProposalDetailLikersLabel likers={proposal.likers} />
      </OverlayTrigger>
    );
  },

  render() {
    const { proposal, componentClass } = this.props;
    const Component = componentClass;
    if (proposal.likers.length > 0) {
      return <Component className="tags-list__tag">{this.renderContent()}</Component>;
    }

    return null;
  },
});

export default ProposalDetailLikers;
