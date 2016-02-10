import React from 'react';
import { IntlMixin, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const ProposalDetailLikers = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getLikersLabel() {
    const { proposal } = this.props;
    if (proposal.likers.length === 1) {
      return proposal.likers[0].displayName.substring(0, 30) + '...';
    }
    return (
      <FormattedMessage
        message={this.getIntlMessage('proposal.likers.count')}
        num={proposal.likers.length}
      />
    );
  },

  getLikersTooltip() {
    const { proposal } = this.props;
    if (proposal.likers.length === 1) {
      return (
        <FormattedMessage
          message={this.getIntlMessage('proposal.likers.label')}
          user={proposal.likers[0].displayName}
        />
      );
    }
    const message =
      proposal.likers.map((liker) => {
        return liker.displayName;
      })
      .join('<br/>')
    ;
    return (
      <span>
        <FormattedMessage message={this.getIntlMessage('proposal.likers.count')} num={proposal.likers.length} />
        <br/>
        <FormattedHTMLMessage message={message} />
      </span>
  );
  },

  render() {
    const { proposal } = this.props;
    if (proposal.likers.length > 0) {
      return (
        <span className="proposal__info">
          <OverlayTrigger placement="top" overlay={
            <Tooltip id={'proposal-' + proposal.id + '-likers-tooltip-'}>
              {this.getLikersTooltip()}
            </Tooltip>
          }>
            <span>
              <i className="cap cap-heart-1 icon--red"></i>
              {this.getLikersLabel()}
            </span>
          </OverlayTrigger>
        </span>
      );
    }

    return null;
  },
});

export default ProposalDetailLikers;
