import React from 'react';
import { IntlMixin, FormattedMessage, FormattedHTMLMessage } from 'react-intl';

const ProposalDetailLikersTooltipLabel = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { proposal } = this.props;
    if (proposal.likers.length === 1) {
      return (
        <FormattedMessage
          message={this.getIntlMessage('proposal.likers.label')}
          user={proposal.likers[0].displayName}
        />
      );
    }
    if (proposal.likers.length > 1) {
      const message =
          proposal.likers.map((liker) => {
            return liker.displayName;
          })
          .join('<br/>')
        ;
      return (
        <span>
          <FormattedMessage message={this.getIntlMessage('proposal.likers.count')} num={proposal.likers.length}/>
          <br/>
          <FormattedHTMLMessage message={message}/>
        </span>
      );
    }
    return null;
  },
});

export default ProposalDetailLikersTooltipLabel;
